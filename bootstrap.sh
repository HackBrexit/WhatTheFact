#!/usr/bin/env bash
apt-get update
apt-get install python-software-properties -y
apt-add-repository ppa:brightbox/ruby-ng -y
apt-get update
apt-get install ruby2.3 ruby2.3-dev mongodb-server make -y
gem install bundler
