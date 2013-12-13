require_relative '../lib/faces.rb'

describe Faces do

  it "finds the faces" do
    expect(Faces.faces_in('images/test.jpg').size).to eq 1
    expect(Faces.faces_in('images/group.jpg').size).to eq 10
  end
end
