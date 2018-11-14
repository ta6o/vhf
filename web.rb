#coding: utf-8

require 'sinatra'
require 'sinatra/content_for'
require 'json'
require 'haml'
require 'csv'
require 'pp'

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


# python2 ./ham2mon.py -w -m -f 156.7e6 -r 1e6 -n4 -t 10 -s -60 -g 14 -a "hackrf"
$offset = 0.670

begin
  $data = JSON.parse(File.read("./data/data.json"))
rescue
  $data = {}
end

def parse_recordings
  Dir.foreach("./recording").each do |f|
    next unless f.match /^\d+\.\d+_\d{10}.wav$/
    next if $data.has_key?(f)
    $data[f] = { 
      :f => (f.match(/^\d+\.\d+/)[0].to_f - $offset).round(3),
      :d => `soxi -D #{Dir.pwd}/recording/#{f}`.to_f * 2,
      :t => Time.at(f.match(/_\d{10}\./)[0].to_i).to_s
    }
  end
  File.open("./data/data.json","w") {|f| f << $data.to_json }
end

