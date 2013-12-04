require 'ffi'

module Faces
  extend FFI::Library
  ffi_lib File.join(File.expand_path(File.join(File.dirname(__FILE__))), 'libfaces.so')
  attach_function :detect_faces, [:string, :string], :string

  def self.faces_in(image)
    keys = [:x,:y,:width,:height]
    detect_faces(image, nil).split("n").map do |e|
      vals = e.split(';').map(&:to_i)
      Hash[ keys.zip(vals) ]
    end
  end
end

describe Faces do
  it "counts all the faces" do
    expect(Faces.faces_in('group.jpg').count).to eq 11
  end
end

# p Faces.faces_in('test.jpg')
# p Faces.faces_in('group.jpg').count
