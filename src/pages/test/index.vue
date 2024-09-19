<script setup>
import { showPreView } from '@/utils/popup'

const data = {
	id: 670,
	name: 'IMG_1134 2.HEIC',
	path: '/nestTest/1',
	type: 'image/heic',
	blurhash: null,
	videoSrc:
		'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726325100399.MOV',
	fileMd5: '9545b79f8ba0029c4b8973f47577d7ac',
	url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726325100127.HEIC',
	size: 348938,
	userId: 1,
	createdAt: '2024-09-14T14:45:01.268Z',
	updatedAt: '2024-09-14T14:45:01.564Z',
	exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"24939/2701"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:08 17:11:57"},"DateTimeDigitized":{"value":"2024:09:08 17:11:57"},"DateTimeOriginal":{"value":"2024:09:08 17:11:57"},"DigitalZoomRatio":{"value":"1512/1249"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"0/1"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/2513"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"348938"},"Flash":{"value":"16"},"FocalLength":{"value":"253126/37417"},"FocalLengthIn35mmFilm":{"value":"58"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"173611/9632"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:08"},"GPSDestBearing":{"value":"365491/1086"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"286071/5162"},"GPSImgDirection":{"value":"365491/1086"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 23\' 25.060\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 36\' 44.160\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"67667/3514"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2596"},"GPSTimeStamp":{"value":"9/1 11/1 5641/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"64"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4299 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"242830/21499"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"234"},"SubSecTimeOriginal":{"value":"234"},"SubjectArea":{"value":"2013 1502 1161 662"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
	file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726325100127.HEIC',
	fileType: 'IMAGE',
	thumbnail:
		'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726325100127.HEIC?x-oss-process=image/resize,l_500',
}
const urlList = [
	{
		id: 598,
		name: 'IMG_0992.heic',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323388517.MOV',
		fileMd5: '3ac65cd34db96af6791ca34e4c7de620',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323387913.heic',
		size: 1945261,
		userId: 1,
		createdAt: '2024-09-14T14:16:29.353Z',
		updatedAt: '2024-09-14T14:16:29.864Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"99749/11071"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 13:23:17"},"DateTimeDigitized":{"value":"2024:09:01 13:23:17"},"DateTimeOriginal":{"value":"2024:09:01 13:23:17"},"DigitalZoomRatio":{"value":"72/49"},"ExifTag":{"value":"256"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/1287"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"1945261"},"Flash":{"value":"16"},"FocalLength":{"value":"251773/37217"},"FocalLengthIn35mmFilm":{"value":"71"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"66151/8472"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"389136/2515"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"126359/17065"},"GPSImgDirection":{"value":"389136/2515"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 27\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 32.900\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"22652/46079"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2626"},"GPSTimeStamp":{"value":"5/1 23/1 16/1"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"64"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4367 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"104207/10088"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"138"},"SubSecTimeOriginal":{"value":"138"},"SubjectArea":{"value":"2001 1488 1153 661"},"TileLength":{"value":"512"},"TileWidth":{"value":"512"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323387913.heic',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323387913.heic?x-oss-process=image/resize,l_500',
	},
	{
		id: 600,
		name: 'IMG_0994.HEIC',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323396525.MOV',
		fileMd5: 'eddc5514ca23626bbefeafbf6c2e5467',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323396156.HEIC',
		size: 2177664,
		userId: 1,
		createdAt: '2024-09-14T14:16:37.323Z',
		updatedAt: '2024-09-14T14:16:37.839Z',
		exif: '{"ApertureValue":{"value":"62890/21169"},"BrightnessValue":{"value":"39103/10990"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 13:26:24"},"DateTimeDigitized":{"value":"2024:09:01 13:26:24"},"DateTimeOriginal":{"value":"2024:09:01 13:26:24"},"DigitalZoomRatio":{"value":"504/503"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/60"},"FNumber":{"value":"14/5"},"FileSize":{"value":"2177664"},"Flash":{"value":"16"},"FocalLength":{"value":"2052196/131047"},"FocalLengthIn35mmFilm":{"value":"120"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"55073/2769"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"226507/2032"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"384356/9601"},"GPSImgDirection":{"value":"226507/2032"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 27.970\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 36.310\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2774"},"GPSTimeStamp":{"value":"5/1 26/1 2398/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"250"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 15.66mm f/2.8"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4878 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"99523/16822"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"825"},"SubSecTimeOriginal":{"value":"825"},"SubjectArea":{"value":"1996 1493 2323 1336"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323396156.HEIC',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323396156.HEIC?x-oss-process=image/resize,l_500',
	},
	{
		id: 602,
		name: 'IMG_1001.HEIC',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323404386.MOV',
		fileMd5: '51cbf99e3c2ea16e213fffee8a7e23de',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323404125.HEIC',
		size: 845394,
		userId: 1,
		createdAt: '2024-09-14T14:16:45.213Z',
		updatedAt: '2024-09-14T14:16:45.691Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"399497/38001"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 13:30:48"},"DateTimeDigitized":{"value":"2024:09:01 13:30:48"},"DateTimeOriginal":{"value":"2024:09:01 13:30:48"},"DigitalZoomRatio":{"value":"14/13"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/4049"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"845394"},"Flash":{"value":"16"},"FocalLength":{"value":"253126/37417"},"FocalLengthIn35mmFilm":{"value":"52"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"494182/33235"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"280173/2164"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"65381/3351"},"GPSImgDirection":{"value":"280173/2164"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 25.400\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 37.900\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2602"},"GPSTimeStamp":{"value":"5/1 30/1 4822/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"64"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4328 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"49934/4167"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"730"},"SubSecTimeOriginal":{"value":"730"},"SubjectArea":{"value":"2013 1507 1160 663"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323404125.HEIC',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323404125.HEIC?x-oss-process=image/resize,l_500',
	},
	{
		id: 604,
		name: 'IMG_1021.HEIC',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323413559.MOV',
		fileMd5: 'c41e42fa354592ffa8af3dcd4165ee06',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323413157.HEIC',
		size: 2950223,
		userId: 1,
		createdAt: '2024-09-14T14:16:54.344Z',
		updatedAt: '2024-09-14T14:16:54.848Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"117127/12012"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 14:03:52"},"DateTimeDigitized":{"value":"2024:09:01 14:03:52"},"DateTimeOriginal":{"value":"2024:09:01 14:03:52"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/2710"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"2950223"},"Flash":{"value":"16"},"FocalLength":{"value":"253126/37417"},"FocalLengthIn35mmFilm":{"value":"24"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"101203/6842"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"134149/5414"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"35/1"},"GPSImgDirection":{"value":"134149/5414"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 19.300\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 40.430\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2582"},"GPSTimeStamp":{"value":"6/1 3/1 5167/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"80"},"ImageHeight":{"value":"4284"},"ImageWidth":{"value":"5712"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4334 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"5712"},"PixelYDimension":{"value":"4284"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"56302/4937"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"650"},"SubSecTimeOriginal":{"value":"650"},"SubjectArea":{"value":"2846 2133 3129 1876"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323413157.HEIC',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323413157.HEIC?x-oss-process=image/resize,l_500',
	},
	{
		id: 606,
		name: 'IMG_1018.heic',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323418521.MOV',
		fileMd5: '5b59701a2175efb5b8c5c8de719f0246',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323418143.heic',
		size: 3936179,
		userId: 1,
		createdAt: '2024-09-14T14:16:59.357Z',
		updatedAt: '2024-09-14T14:16:59.836Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"40347/5138"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 14:00:33"},"DateTimeDigitized":{"value":"2024:09:01 14:00:33"},"DateTimeOriginal":{"value":"2024:09:01 14:00:33"},"DigitalZoomRatio":{"value":"302887/195382"},"ExifTag":{"value":"256"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/723"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"3936179"},"Flash":{"value":"16"},"FocalLength":{"value":"251773/37217"},"FocalLengthIn35mmFilm":{"value":"37"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"103391/6249"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"363985/2382"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"95263/6922"},"GPSImgDirection":{"value":"363985/2382"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 21.970\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 42.680\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2626"},"GPSTimeStamp":{"value":"6/1 0/1 33/1"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"80"},"ImageHeight":{"value":"4284"},"ImageWidth":{"value":"5712"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4375 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"5712"},"PixelYDimension":{"value":"4284"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"37247/3922"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"766"},"SubSecTimeOriginal":{"value":"766"},"SubjectArea":{"value":"2847 2132 3291 1886"},"TileLength":{"value":"896"},"TileWidth":{"value":"640"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323418143.heic',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323418143.heic?x-oss-process=image/resize,l_500',
	},
	{
		id: 608,
		name: 'IMG_1031.heic',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323424031.MOV',
		fileMd5: '72d4c941133397cfd633632e3518f996',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323423774.heic',
		size: 1553759,
		userId: 1,
		createdAt: '2024-09-14T14:17:04.897Z',
		updatedAt: '2024-09-14T14:17:05.264Z',
		exif: '{"ApertureValue":{"value":"58609/19728"},"BrightnessValue":{"value":"40017/3979"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 14:51:24"},"DateTimeDigitized":{"value":"2024:09:01 14:51:24"},"DateTimeOriginal":{"value":"2024:09:01 14:51:24"},"ExifTag":{"value":"256"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/903"},"FNumber":{"value":"14/5"},"FileSize":{"value":"1553759"},"Flash":{"value":"16"},"FocalLength":{"value":"2052196/131047"},"FocalLengthIn35mmFilm":{"value":"120"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"74913/10363"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"172012/2117"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"158500/20223"},"GPSImgDirection":{"value":"172012/2117"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 24.250\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 37.220\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2774"},"GPSTimeStamp":{"value":"6/1 51/1 24/1"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"50"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 15.66mm f/2.8"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4799 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"323949/32996"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"536"},"SubSecTimeOriginal":{"value":"536"},"SubjectArea":{"value":"1992 1521 2318 1333"},"TileLength":{"value":"512"},"TileWidth":{"value":"512"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323423774.heic',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323423774.heic?x-oss-process=image/resize,l_500',
	},
	{
		id: 610,
		name: 'IMG_0997.HEIC',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323434304.MOV',
		fileMd5: 'fb288b1466985f71411997a5e44a7352',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323433855.HEIC',
		size: 5479787,
		userId: 1,
		createdAt: '2024-09-14T14:17:15.149Z',
		updatedAt: '2024-09-14T14:17:15.595Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"30059/7383"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 13:27:52"},"DateTimeDigitized":{"value":"2024:09:01 13:27:52"},"DateTimeOriginal":{"value":"2024:09:01 13:27:52"},"DigitalZoomRatio":{"value":"39399/27890"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/121"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"5479787"},"Flash":{"value":"16"},"FocalLength":{"value":"253126/37417"},"FocalLengthIn35mmFilm":{"value":"35"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"86682/14735"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"117925/919"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"147748/30605"},"GPSImgDirection":{"value":"117925/919"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 28.120\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 37\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"6315/26462"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2602"},"GPSTimeStamp":{"value":"5/1 27/1 5200/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"160"},"ImageHeight":{"value":"4284"},"ImageWidth":{"value":"5712"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4407 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"5712"},"PixelYDimension":{"value":"4284"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"72879/10529"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"475"},"SubSecTimeOriginal":{"value":"475"},"SubjectArea":{"value":"2838 2137 3277 1886"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323433855.HEIC',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323433855.HEIC?x-oss-process=image/resize,l_500',
	},
	{
		id: 612,
		name: 'IMG_0999.HEIC',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323439310.MOV',
		fileMd5: 'd6984274239ef8bceede423a31cfde23',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323438969.HEIC',
		size: 2296966,
		userId: 1,
		createdAt: '2024-09-14T14:17:20.125Z',
		updatedAt: '2024-09-14T14:17:20.594Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"71753/14100"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 13:29:55"},"DateTimeDigitized":{"value":"2024:09:01 13:29:55"},"DateTimeOriginal":{"value":"2024:09:01 13:29:55"},"DigitalZoomRatio":{"value":"1512/1259"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/136"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"2296966"},"Flash":{"value":"16"},"FocalLength":{"value":"253126/37417"},"FocalLengthIn35mmFilm":{"value":"58"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"50413/3217"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"183792/2533"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"85402/4901"},"GPSImgDirection":{"value":"183792/2533"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 26.450\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 37.380\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2602"},"GPSTimeStamp":{"value":"5/1 29/1 5498/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"100"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4357 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"84397/11903"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"495"},"SubSecTimeOriginal":{"value":"495"},"SubjectArea":{"value":"2008 1502 1161 661"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323438969.HEIC',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323438969.HEIC?x-oss-process=image/resize,l_500',
	},
	{
		id: 614,
		name: 'IMG_1008.HEIC',
		path: '/nestTest/1',
		type: 'image/heic',
		blurhash: null,
		videoSrc:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323445735.MOV',
		fileMd5: 'e8bb3a7ddea7b4b21f292e218c99f575',
		url: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323445476.HEIC',
		size: 1132756,
		userId: 1,
		createdAt: '2024-09-14T14:17:26.581Z',
		updatedAt: '2024-09-14T14:17:26.979Z',
		exif: '{"ApertureValue":{"value":"42657/25639"},"BrightnessValue":{"value":"20221/113085"},"ColorSpace":{"value":"65535"},"CompositeImage":{"value":"2"},"DateTime":{"value":"2024:09:01 13:34:20"},"DateTimeDigitized":{"value":"2024:09:01 13:34:20"},"DateTimeOriginal":{"value":"2024:09:01 13:34:20"},"DigitalZoomRatio":{"value":"1512/1259"},"ExifTag":{"value":"232"},"ExifVersion":{"value":"48 50 51 50"},"ExposureBiasValue":{"value":"45664/68633"},"ExposureMode":{"value":"0"},"ExposureProgram":{"value":"2"},"ExposureTime":{"value":"1/25"},"FNumber":{"value":"1244236/699009"},"FileSize":{"value":"1132756"},"Flash":{"value":"16"},"FocalLength":{"value":"253126/37417"},"FocalLengthIn35mmFilm":{"value":"58"},"Format":{"value":"heic"},"FrameCount":{"value":"1"},"GPSAltitude":{"value":"101441/8128"},"GPSAltitudeRef":{"value":"0"},"GPSDateStamp":{"value":"2024:09:01"},"GPSDestBearing":{"value":"139812/3863"},"GPSDestBearingRef":{"value":"T"},"GPSHPositioningError":{"value":"40/1"},"GPSImgDirection":{"value":"139812/3863"},"GPSImgDirectionRef":{"value":"T"},"GPSLatitude":{"value":"22deg 21\' 25.460\\" "},"GPSLatitudeRef":{"value":"North"},"GPSLongitude":{"value":"113deg 30\' 38.040\\" "},"GPSLongitudeRef":{"value":"East"},"GPSSpeed":{"value":"0/1"},"GPSSpeedRef":{"value":"K"},"GPSTag":{"value":"2602"},"GPSTimeStamp":{"value":"5/1 34/1 2002/100"},"HostComputer":{"value":"iPhone 15 Pro Max"},"ISOSpeedRatings":{"value":"500"},"ImageHeight":{"value":"3024"},"ImageWidth":{"value":"4032"},"LensMake":{"value":"Apple"},"LensModel":{"value":"iPhone 15 Pro Max back triple camera 6.765mm f/1.78"},"LensSpecification":{"value":"1551800/699009 2052196/131047 1244236/699009 14/5"},"Make":{"value":"Apple"},"MakerNote":{"value":"4434 bytes undefined data"},"MeteringMode":{"value":"5"},"Model":{"value":"iPhone 15 Pro Max"},"OffsetTime":{"value":"+08:00"},"OffsetTimeDigitized":{"value":"+08:00"},"OffsetTimeOriginal":{"value":"+08:00"},"Orientation":{"value":"1"},"PixelXDimension":{"value":"4032"},"PixelYDimension":{"value":"3024"},"ResolutionUnit":{"value":"2"},"SceneType":{"value":"1"},"SensingMethod":{"value":"2"},"ShutterSpeedValue":{"value":"41546/8947"},"Software":{"value":"17.5.1"},"SubSecTimeDigitized":{"value":"537"},"SubSecTimeOriginal":{"value":"537"},"SubjectArea":{"value":"2008 1500 1161 661"},"WhiteBalance":{"value":"0"},"XResolution":{"value":"72/1"},"YResolution":{"value":"72/1"}}',
		file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323445476.HEIC',
		fileType: 'IMAGE',
		thumbnail:
			'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1726323445476.HEIC?x-oss-process=image/resize,l_500',
	},
]
function showDlg() {
	showPreView({
		urlList,
	})
}
</script>

<template>
	<button class="btn" @click="showDlg">打开</button>
	<!-- <image-viewer :url-list /> -->
	<!-- <div class="w-100 h-100 rounded-xl overflow-hidden">
		<card-map-card :data />

	</div> -->
</template>

<style lang="less" scoped></style>
