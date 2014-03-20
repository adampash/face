#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/objdetect/objdetect.hpp>
#include <opencv2/highgui/highgui.hpp>

#include <iostream>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

using namespace std;
using namespace cv;

char buf[4096];
char cbuf[4096];
extern "C" char* detect_faces(char* input_file, char* output_file);

int main(int argc, char** argv) {
  if(argc<2){
    fprintf(stderr, "usage:\n%s <action> <image>\n%s <action> <image> <outimg>\n", argv[0], argv[0]);
    fprintf(stderr, "Actions include 'detect' and 'crop'\n");
    exit(-1);
  }


  int i = 0;
  if (argv[1][i] != '\0') {
    char letter = argv[1][i];

    switch(letter) {
      case 'c':
        // crop(argv[2], argv[3]);
        printf("Crop is currently removed");
        break;
      case 'd':
        printf("%s", detect_faces(argv[2], argc<3 ? NULL : argv[3]));
        break;
      default:
        printf("Erm, something went wrong");
    }
    exit(0);
  }

}

char* detect_faces(char* input_file, char* output_file) {
  memset(buf, 0, 4096);
  memset(cbuf, 0, 4096);
  CascadeClassifier frontal_cascade;
  CascadeClassifier profile_cascade;
  CascadeClassifier eyes_cascade;

  //load classifier cascade
  // if(!profile_cascade.load("cascades/haarcascade_profileface.xml")) exit(-2);
  // if(!frontal_cascade.load("cascades/lbpcascade_frontalface.xml")) exit(-2);
  if(!frontal_cascade.load("cascades/haarcascade_frontalface_alt.xml")) exit(-2);

  Mat imgbw, image = imread((string)input_file); //read image
  if(image.empty()) exit(-3);

  normalize(image, imgbw, 0, 255, NORM_MINMAX, CV_8UC1);

  //create a grayscale copy
  cvtColor(image, imgbw, CV_BGR2GRAY); 

  //apply histogram equalization
  equalizeHist(imgbw, imgbw); 

  // for debugging purposes; see what image looks like before detection
  // imwrite("sample.jpg", imgbw);

  vector<Rect> faces;
  // vector<Rect> profile_faces;

  //detect faces
  // frontal_cascade.detectMultiScale(imgbw, faces, 1.2, 2);
  frontal_cascade.detectMultiScale(imgbw, faces, 1.1, 1, 0|CV_HAAR_SCALE_IMAGE, Size(5, 5));
  // profile_cascade.detectMultiScale(imgbw, profile_faces, 1.2, 2);

  // combine faces vectors
  // faces.reserve(faces.size() + profile_faces.size());
  // faces.insert(faces.end(), profile_faces.begin(), profile_faces.end());

  Mat croppedFaceImage;
  for(unsigned int i = 0; i < faces.size(); i++){
    Rect f = faces[i];


    croppedFaceImage = imgbw(f).clone();

    int imgCount = 1;
    int dims = 1;
    const int sizes[] = {256};
    const int channels[] = {0};
    float range[] = {0,256};
    const float *ranges[] = {range};

    Mat mask = Mat();
    Mat hist;
    calcHist(&croppedFaceImage, imgCount, channels, mask, hist, dims, sizes, ranges);
    // to implement eye detection, see 
    // http://docs.opencv.org/doc/tutorials/objdetect/cascade_classifier/cascade_classifier.html#cascade-classifier

    //draw rectangles on the image where faces were detected
    rectangle(image, Point(f.x, f.y), Point(f.x + f.width, f.y + f.height), Scalar(255, 0, 0), 4, 8);

    //fill buffer with easy to parse face representation
    sprintf(buf + strlen(buf), "%i;%i;%i;%in", f.x, f.y, f.width, f.height);
    if(output_file) {
      char* file;
      sprintf(file, "output%i.jpg", i);
      imwrite((string)file, croppedFaceImage); //write output image
    }
  }
  if (output_file) imwrite((string)output_file, image); //write output image

  return buf;
}
