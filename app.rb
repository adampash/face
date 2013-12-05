require 'sinatra'
require 'json'
require_relative 'lib/faces.rb'

get '/' do
  File.read(File.join('public', 'index.html'))
end

post '/' do
  puts params.to_s
  image = params['upload'][:tempfile].path
  response = Faces.faces_in(image).to_json

  response
end
