#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Wed Oct 11 15:10:40 2017

@author: omd
"""


# Docs :)
# 0 tweetid
# 1 userid
# 2 timestamp
# 3 reply-tweetid
# 4 reply-userid
# 5 source
# 6 truncated?
# 7 geo-tag
# 8 location
# 9 tweet-text
# 10 twittername (text)
# 11 twittername (handle)

# Determine whether code is running on the cluster or locally (for testing)
import socket
achtung = 'achtung' in socket.gethostname()
# If testing locally, find the Spark instalation
if not achtung:
    import findspark
    findspark.init()
import datetime
from pyspark import SparkContext
import os
import numpy as np
import shutil
import time
# If cluster, import stuff to interact with Hadoop file system
if achtung:
    import pydoop.hdfs as hdfs

from pushover import Client

from copy import deepcopy
from dateutil.parser import parse
import json
import re

def pushme(msg, title = ""):
    Client().send_message(msg, title=title)

######################################################################
APP_NAME = "Weather keyword extractor"

# Fraction of data to load
sample_fraction = 1.0
SAVE_LOCAL = False  # Whether to extract data from HDFS
FILES = "tweets.2016-*" # File glob thingy to read in on cluster
outname = "weather_keyword_counts.tsv"
######################################################################

if achtung:
    outpath = outname  #"/net/data/bjarkemoensted/"+outname
else:
    outpath = outname

if achtung:
    path = "hdfs://megatron.ccs.neu.edu/user/amislove/twitter/gardenhose-data/summarized/"+FILES
else:
    path = "sample.txt"

def normalize(loc, state_codes_b):
    '''Normalizes location strings. Little Bjarke wrote this.'''
    
    # remove unicode
    loc = loc.encode('unicode-escape')
    loc = loc.decode('unicode_escape').encode('ascii','ignore')    

    # remove non-alphanumeric
    loc = loc.lower()
    loc = re.sub('[^0-9a-zA-Z]+', ' ', loc)

    # remove US from right side
    loc = ' '.join(loc.split())
    us_names = [' us', ' usa', ' united states', ' united states of america']
    for pattern in us_names:
        loc = re.sub('%s$' % pattern, '', loc)

    # abbreviate state names
    for s in state_codes_b.value:
        loc = loc.replace(s[0], ' '+s[1])

    # cleaning whitespace uses
    loc = ' '.join(loc.split())
    loc = loc.strip()

    if loc == '':
        return None
    return loc

def process(rawline, keyword_map_b):
    '''Converts a tweet entry into a list. Returns None if error.'''
    
    try:
        if isinstance(rawline, str):
            line = rawline.decode('utf-8')
        elif isinstance(rawline, unicode):
            line = rawline
        else:
            raise TypeError("Line neither string nor unicode")
        entries = line.split("\t")
        if len(entries) != 12:
            return None
        
        # text
        text = entries[9]
        words = text.lower().split()
#         for i in range(len(words)-1, -1, -1):
#             if (re.match(url_pattern, words[i])
#                 or words[i] == 'rt'
#                 or words[i].startswith("@")):
#                 del words[i]


        cleaned = ["".join(ch for ch in w if ch.isalnum() or ch in set("-%/\\#@")) for w in words]
        matched = set([])
        for word in cleaned:
            try:
                matched.add(keyword_map_b.value[word])
            except KeyError:
                continue
            #
        
        if len(matched) == 0:
            return None
        
        
        # time
        ts = parse(entries[2])
        ymd = "_".join([str(ts.year).zfill(4)]+list(map(lambda x: str(x).zfill(2), (ts.month, ts.day))))
        
        return ymd, matched, entries[8]
    except:
        print "Failed. Tweet entries:", len(rawline.split("\t"))
        return None

def combine_dicts(a, b):
    result = deepcopy(a)
    for keyword, pdist in b.iteritems():
        if not (keyword in result):
            result[keyword] = deepcopy(pdist)
        else:
            for county, prob in pdist.iteritems():
                try:
                    result[keyword][county] += prob
                except KeyError:
                    result[keyword][county] = prob
                #
            #
        #
    return result

if __name__ == '__main__':
    start_time = time.time()
    
    

    with open("keyword_map.json") as f:
        keyword_map = json.load(f)
    
    # Create sparkcontext (duh)
    sc = SparkContext(appName = APP_NAME)
    
    keyword_map_b = sc.broadcast(keyword_map)
    state_codes = np.loadtxt('cont_states.tsv', delimiter='\t', skiprows=1, usecols=[0,1], dtype='|S25')
    state_codes = np.char.lower(state_codes)
    state_codes_b = sc.broadcast(state_codes)

    with open("normalized_loc_string2p_dist.json") as f:
        loc_string2p_dist = json.load(f)    
    loc_string2p_dist_b = sc.broadcast(loc_string2p_dist)
    
    ymd_matches_rawloc = sc.textFile(path).map(lambda line: process(line, keyword_map_b)).filter(lambda x: x is not None)
    ymd_matches_normloc = ymd_matches_rawloc.map(lambda t: (t[0], t[1], normalize(t[2], state_codes_b))).filter(lambda t: t[2] is not None)
    
    data_with_loc_data = ymd_matches_normloc.filter(lambda t: t[2] in loc_string2p_dist_b.value)
    ymd_dicts = data_with_loc_data.map(lambda t: (t[0], {w : loc_string2p_dist_b.value[t[2]] for w in t[1]}))
    ymd_combined = ymd_dicts.reduceByKey(lambda a,b: combine_dicts(a,b))
    
    ordered = sorted(ymd_combined.collect(), key = lambda t: t[0])
    
    # Stop spark instance
    sc.stop()
    
    with open(outpath, "w") as f:
        for date, dict_ in ordered:
            f.write(date+"\t"+json.dumps(dict_)+"\n")
    
    dt = int(time.time() - start_time)
    timestring = str(datetime.timedelta(seconds = dt))
    
    # If running on cluster, send push notification to my phone.
    if achtung:
        pushme("Finished running "+os.path.split(__file__)[-1] + 
               "\nRuntime: "+timestring)