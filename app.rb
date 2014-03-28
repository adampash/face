require 'sinatra'
require 'json'
require_relative 'lib/faces.rb'
require 'sinatra/cross_origin'

disable :protection

configure do
  enable :cross_origin
end

get '/' do
  File.read(File.join('public', 'index.html'))
end

post '/' do
  # logger.info "HERE ARE PARAMS " + params.to_s
  process_image params
end

def process_image(params)
  image = params['upload'][:tempfile].path

  response = Faces.faces_in(image).to_json

  response
end
