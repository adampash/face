#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include <ppapi/cpp/var_array.h>
#include <ppapi/cpp/var_array_buffer.h>
#include <ppapi/cpp/var_dictionary.h>

#include <opencv2/imgproc/imgproc.hpp>
#include "opencv2/objdetect/objdetect.hpp"
#include <opencv2/highgui/highgui.hpp>

#include <stdio.h>

std::string detect_faces(cv::Mat img);

class FaceDetectInstance : public pp::Instance {
  public:
    explicit FaceDetectInstance(PP_Instance instance)
      : pp::Instance(instance) {}
    virtual ~FaceDetectInstance() {}

    // Handle message passed in from JavaScript
    virtual void HandleMessage(const pp::Var& message) {
      // ignore the message if it's not a dictionary
      if (!message.is_dictionary()) {
        PostMessage("No good. Not a dictionary");
      } else {
        // cast the dictionary
        pp::VarDictionary dictionary(message);
        std::string action = dictionary.Get("action").AsString();
        if (action == "detect") {
          // get data and convert it to cv::Mat type
          int width = dictionary.Get("width").AsInt();
          int height = dictionary.Get("height").AsInt();
          pp::VarArrayBuffer array_buffer(dictionary.Get("data"));
          if (!array_buffer.is_null()) {
            if (width > 0 && height > 0) {
              // uint32_t* pixels = static_cast<uint32_t*>(array_buffer.Map());
              // const cv::_InputArray* pix_pass = static_cast<cv::_InputArray*>(array_buffer.Map());
              // unsigned char* pixels = static_cast<unsigned char*>(array_buffer.Map());
              uint32_t* pixels = static_cast<uint32_t*>(array_buffer.Map());
              // cv::Mat img = cv::imdecode(*pix_pass, 1);
              // cv::Mat img = cv::imdecode(array_buffer);
              // cv::Mat img(cv::Size(width, height), CV_8UC1, pixels,
              //             cv::Mat::AUTO_STEP);
              cv::Mat img(cv::Size(width, height), CV_8UC1);
              memcpy(img.ptr(), (void*) pixels,height * width * 4);
              array_buffer.Unmap();
              if (img.empty()) {
                PostMessage("Mat Image is empty");
              } else {
                std::string result = detect_faces(img);
                PostMessage(result);
                PostMessage(img.rows);
                PostMessage(img.cols);
                PostMessage(img.dims);
                // PostMessage(pixels);
                // PostMessage(img);
              }
            } else {
              PostMessage("No good. Width and height are messed up");
            }
          } else {
            PostMessage("No good. Array buffer is null.");
          }
        } else {
          PostMessage("No supported action");
        }
        PostMessage("Made it through");
      }
    }

    // using namespace cv;
    std::string detect_faces(cv::Mat img) {
      cv::Mat imgbw;
      cv::normalize(img, img, 0, 255, cv::NORM_MINMAX, CV_8UC1);

      //create a grayscale copy
      // PostMessage(CV_BGR2GRAY);
      // cv::cvtColor(img, imgbw, CV_RGB2GRAY); 

      //apply histogram equalization
      cv::equalizeHist(imgbw, imgbw);

      cv::vector<cv::Rect> faces;

      //detect faces
      cv::CascadeClassifier frontal_cascade;
      frontal_cascade.detectMultiScale(imgbw, faces, 1.1, 1, 0|CV_HAAR_SCALE_IMAGE, cv::Size(5, 5));
      return "{\"foo\": \"bar\"}";
      // return img.dims;
    }

    void logmsg(const char* pMsg){
      fprintf(stdout,"logmsg: %s\n",pMsg);
    }
    void errormsg(const char* pMsg){
      fprintf(stderr,"logerr: %s\n",pMsg);
    }

};

class FaceDetectModule : public pp::Module {
  public:
    FaceDetectModule() : pp::Module() {}
    virtual ~FaceDetectModule() {}

    virtual pp::Instance* CreateInstance(PP_Instance instance) {
      return new FaceDetectInstance(instance);
    }
};

namespace pp {

  Module* CreateModule() {
    return new FaceDetectModule();
  }
}

