#coding: utf-8

require 'sinatra'
require 'sinatra/content_for'
require 'json'
require 'haml'
require 'csv'
require 'pp'
require './lib/util.rb'

$session = nil

get "/?" do 
  haml :index
end

not_found do 
  redirect to "/"
end

error do 
  return haml :error
end

