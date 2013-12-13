#include "opencv2/core/core.hpp"
#include "contrib/include/opencv2/contrib/contrib.hpp"
#include <imgproc/include/opencv2/imgproc/imgproc.hpp>
#include <objdetect/include/opencv2/objdetect/objdetect.hpp>
#include <highgui/include/opencv2/highgui/highgui.hpp>
// #include "opencv2/contrib/contrib.hpp"
// #include "opencv2/highgui/highgui.hpp"
// #include "opencv2/imgproc/imgproc.hpp"
// #include "opencv2/objdetect/objdetect.hpp"
#include "../faces.cpp"

#include <iostream>
#include <fstream>
#include <sstream>

using namespace cv;
using namespace std;
// #include "opencv2/opencv.hpp"

using namespace cv;

int main(int, char**)
{
  VideoCapture cap(CV_CAP_ANY); // open the default camera
  cap.set(CV_CAP_PROP_FRAME_WIDTH, 320);
  cap.set(CV_CAP_PROP_FRAME_HEIGHT, 240);

  if(!cap.isOpened())  // check if we succeeded
    return -1;

  Mat edges;
  namedWindow("edges",CV_WINDOW_AUTOSIZE);
  for(;;)
  {
    Mat frame;
    cap >> frame; // get a new frame from camera
    // cap.read(frame); // is equivalent to above

    // only create window if camera has started capturing
    if (frame.size().width > 0) {
      // cvtColor(frame, edges, CV_BGR2GRAY);
      // GaussianBlur(edges, edges, Size(7,7), 1.5, 1.5);
      // Canny(frame, edges, 0, 30, 3);
      CascadeClassifier frontal_cascade;
      CascadeClassifier profile_cascade;

      if(!profile_cascade.load("cascades/lbpcascade_profileface.xml")) exit(-2); //load classifier cascade
      if(!frontal_cascade.load("cascades/lbpcascade_frontalface.xml")) exit(-2); //load classifier cascade

      ////////// detect faces ///////////
      // prepare image
      Mat image = frame.clone();
      Mat imgbw;
      normalize(image, imgbw, 0, 255, NORM_MINMAX, CV_8UC1);
      cvtColor(image, imgbw, CV_BGR2GRAY); //create a grayscale copy
      equalizeHist(imgbw, imgbw); //apply histogram equalization

      // detect faces
      vector<Rect> faces;
      vector<Rect> profile_faces;
      frontal_cascade.detectMultiScale(imgbw, faces, 1.2, 2);
      profile_cascade.detectMultiScale(imgbw, profile_faces, 1.2, 2);

      // combine faces vectors
      faces.reserve(faces.size() + profile_faces.size());
      faces.insert(faces.end(), profile_faces.begin(), profile_faces.end());

      ////////// done w/face detect ///////////

      // draw rectangles over detected faces
      for(unsigned int i = 0; i < faces.size(); i++){
        Rect f = faces[i];

        //draw rectangles on the image where faces were detected
        rectangle(image, Point(f.x, f.y), Point(f.x + f.width, f.y + f.height), Scalar(255, 0, 0), 4, 8);
        // char buf[4096];
        // sprintf(buf, "%i;%i;%i;%in", f.x, f.y, f.width, f.height);
      }
      imshow("detected", image);
      imshow("edges", frame);
    }
    if(waitKey(30) >= 0) break;
  }
  // the camera will be deinitialized automatically in VideoCapture destructor
  return 0;
}
