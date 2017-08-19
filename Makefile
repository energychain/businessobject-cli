#
# StromDAO Business Object - Decentralized Apps
# Deployment via Makefile to automate general Quick Forward 
#

PROJECT = "StromDAO Business Object - CLI"

all: commit origin publish

commit: ;git commit -a ;
    
# test: ;npm test;

origin: ;git push origin;

publish: ;npm publish;
