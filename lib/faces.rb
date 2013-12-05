require 'ffi'

module Faces
  extend FFI::Library
  ffi_lib File.join(File.expand_path(File.join(File.dirname(__FILE__))), 'libfaces.so')
  attach_function :detect_faces, [:string, :string], :string

  def self.faces_in(image)
    # detect_faces(image, nil)
    keys = [:x,:y,:width,:height]
    detect_faces(image, nil).split("n").map do |e|
      vals = e.split(';').map(&:to_i)
      Hash[ keys.zip(vals) ]
    end
  end
end
