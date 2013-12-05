require_relative '../lib/faces.rb'

describe Faces do

  it "counts all the faces" do
    4.times do
      puts Faces.faces_in('images/test.jpg').size.to_s + "  (should be 1)"
    end
    puts Faces.faces_in('images/group.jpg').size.to_s + " (should be 10)"
  end
end

# p Faces.faces_in('images/test.jpg')
# p Faces.faces_in('images/group.jpg')
