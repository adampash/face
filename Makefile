LIBS=-lopencv_imgproc -lopencv_highgui -lopencv_core -lopencv_objdetect
INCLUDES=-I/usr/local/Cellar/opencv/2.4.6.1/include/

all:
	g++ ${INCLUDES} -fpic -Wall -c faces.cpp
	# create shared library
	g++ ${INCLUDES} -o libfaces.so faces.o ${LIBS}
	# create executable (in case you want to play with it directly)
	g++ ${INCLUDES} -o faces faces.o ${LIBS}
