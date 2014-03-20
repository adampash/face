LIBS=-lopencv_imgproc -lopencv_highgui -lopencv_core -lopencv_objdetect
# INCLUDES=-I/usr/local/Cellar/opencv/2.4.6.1/include/
# INCLUDES=-I/usr/local/Cellar/opencv/2.4.5/include/
# INCLUDES=-I/usr/local/Cellar/opencv/2.4.8/include/

CFLAGS:=-v
FLAGS=-arch x86_64

all:
	g++ ${INCLUDES} -fpic -Wall -c faces.cpp ${FLAGS}
	# create shared library
	g++ ${INCLUDES} -o lib/libfaces.so faces.o ${LIBS} ${FLAGS}
	# create executable (in case you want to play with it directly)
	g++ ${INCLUDES} -o faces faces.o ${LIBS} ${FLAGS}

cam:
	g++ ${INCLUDES} -fpic -Wall -c test/cam.cpp
	# create shared library
	g++ ${INCLUDES} -o libfaces.so cam.o ${LIBS}
	# create executable (in case you want to play with it directly)
	g++ ${INCLUDES} -o cam cam.o ${LIBS}

runcam: cam
	./cam

# train:
# 	g++ ${INCLUDES} -fpic -Wall -c -v facerec_eigenfaces.cpp -mmacosx-version-min=10.8
# 	# create shared library
# 	g++ ${INCLUDES} -o -v facerec_eigenfaces.so facerec_eigenfaces.o ${LIBS}
# 	# create executable (in case you want to play with it directly)
# 	g++ ${INCLUDES} -o facerec_eigenfaces facerec_eigenfaces.o ${LIBS} -mmacosx-version-min=10.8
