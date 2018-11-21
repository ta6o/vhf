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

get "/update/?" do 
  update_recordings
end

get "/loginfo/:ts/?" do 
  pick_from_log(params["ts"][0..9]).to_json
end

not_found do 
  redirect to "/"
end

error do 
  return haml :error
end


# python2 ./ham2mon.py -w -m -f 156.7e6 -r 1e6 -n4 -t 10 -s -60 -g 14 -a "hackrf"
$offset = 0

begin
  $data = JSON.parse(File.read("./public/txs/data.json"))
rescue
  $data = {}
end


def pick_from_log ts
  logcsv = "/var/www/gauge/public/data/log.csv"
  #logcsv = "/home/ro1/git/gauge/public/data/log.csv"
  tts = ts.to_i
  return [] unless tts.to_s == ts.to_s
  lts = Time.now.to_i
  dif = (tts - lts) / 60
  lln = `cat #{logcsv} | wc -l`.strip.to_i
  p [tts, dif, lln]
  line = lln + dif
  enough = false
  difs = []
  while dif.abs > 1 and not enough
    lts = `sed '#{line.abs}q;d' #{logcsv}`.strip.split(",")[0].to_i
    dif = (tts - lts) / 60
    difs << dif
    line += dif
    line = 1 if line < 1
    line = lln if line > lln
    enough = true if difs.length - difs.uniq.length > 4
    pp [lts, dif, lln]
  end
  return [] if enough
  `sed '#{line}q;d' #{logcsv}`.strip.split(",")
end

def parse_recordings
  txs = "#{Dir.pwd}/public/txs/"
  `ls -ltr #{txs}*.wav > #{txs}prev.diff`
  l = `cat #{txs}prev.diff | wc -l`.strip
  Dir.foreach("./public/txs").sort.each_with_index do |fn,i|
    print "Parsing #{i} / #{l}\r"
    parse_file fn
  end
  File.open("./public/txs/data.json","w") {|f| f << $data.to_json }
end

def update_recordings
  txs = "#{Dir.pwd}/public/txs/"
  diff = `ls -ltr #{txs}*.wav > #{txs}next.diff && diff #{txs}prev.diff #{txs}next.diff`
  `cp #{txs}next.diff #{txs}prev.diff`
  diff = diff.split(/\n+/)
  diff.shift
  diff.map! {|d| d.split(/\//)[-1]}
  parsed = 0
  diff.sort.each_with_index do |fn,i|
    parsed += parse_file fn
  end
  File.open("#{txs}data.json","w") {|f| f << $data.to_json }
  [parsed,diff.length].to_json
end

def parse_file fn
  return 0 unless fn.match /^\d+\.\d+_\d{13}.wav$/
  fq = (fn.match(/^\d+\.\d+/)[0].to_f - $offset).round(3)
  return 0 unless (fq * 1000) % 25 == 0
  return 0 if fq > 162.5
  return 0 if fq < 156
  f = fq.to_s.ljust(7,"0")
  $data[f] = {"label"=>f, "data"=>[],"ts"=>[]} unless $data.has_key?(f)
  ts = fn.match(/_\d{13}\./)[0][1..-2].to_i
  return 0 if $data[f]["ts"].include?(ts)
  # t = Time.at(ts).to_s
  d = (`soxi -D #{Dir.pwd}/public/txs/#{fn}`.to_f * 1000).to_i
  if d < 400
    `rm #{Dir.pwd}/public/txs/#{fn}`
    return 0 
  end
  $data[f]["ts"] << ts
  $data[f]["data"] << { "d" => d, "t" => ts }
  return 1
end

parse_recordings

