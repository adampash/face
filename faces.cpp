#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/objdetect/objdetect.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <iostream>
#include <stdio.h>
#include <unistd.h>
using namespace std;
using namespace cv;
char buf[4096];
extern "C" char* detect_faces(char* input_file, char* output_file);
 
int main(int argc, char** argv) {
  if(argc<2){
    fprintf(stderr, "usage:n%s <image>n%s <image> <outimg>n", argv[0], argv[0]);
    exit(-1);
  }
  printf("%s", detect_faces(argv[1], argc<3 ? NULL : argv[2]));
  exit(0);
}
 
char* detect_faces(char* input_file, char* output_file) {
  CascadeClassifier cascade;
  if(!cascade.load("lbpcascade_profileface.xml")) exit(-2); //load classifier cascade
  if(!cascade.load("lbpcascade_frontalface.xml")) exit(-2); //load classifier cascade
  Mat imgbw, image = imread((string)input_file); //read image
  if(image.empty()) exit(-3);
  cvtColor(image, imgbw, CV_BGR2GRAY); //create a grayscale copy
  equalizeHist(imgbw, imgbw); //apply histogram equalization
  vector<Rect> faces;
  cascade.detectMultiScale(imgbw, faces, 1.2, 2); //detect faces
  for(unsigned int i = 0; i < faces.size(); i++){
    Rect f = faces[i];
    //draw rectangles on the image where faces were detected
    rectangle(image, Point(f.x, f.y), Point(f.x + f.width, f.y + f.height), Scalar(255, 0, 0), 4, 8);
    //fill buffer with easy to parse face representation
    sprintf(buf + strlen(buf), "%i;%i;%i;%in", f.x, f.y, f.width, f.height);
  }
  if(output_file) imwrite((string)output_file, image); //write output image
  return buf;
}
