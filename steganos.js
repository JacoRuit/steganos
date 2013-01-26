var steganos = {};

steganos.HEADER_START = 4; 	
steganos.HEADER_END = 6; 		
steganos.CHUNK_START = 8;		
steganos.CHUNK_END = 10;		
steganos.CHUNK_SIZE = 12;		

steganos.DATA_URI_JPG_START = "data:image/jpeg;base64,";

steganos.bytesToString = function(byteArray, xhrEscape){
	var string = "";
	for(var i = 0; i < byteArray.length; ++i){
		string += String.fromCharCode(byteArray[i]);
	};
	return string;
};

steganos.stringToBytes = function(string, xhrEscape){
	var bytes = [];
	for(var i = 0; i < string.length; ++i){
		if(xhrEscape)
			bytes.push(string.charCodeAt(i) & 0xff);
		else
			bytes.push(string.charCodeAt(i));
	}
	return bytes;
};

steganos.bytesToBase64 = function(byteArray){
	return window.btoa(steganos.bytesToString(byteArray));
};

steganos.base64ToBytes = function(string){
	return steganos.stringToBytes(window.atob(string));
};

steganos.getImageBytes = function(imageUrl){
	var request = new XMLHttpRequest();
	request.open("GET", imageUrl, false);
	request.overrideMimeType('text\/plain; charset=x-user-defined');
	request.send(null);
	if (request.status != 200) return 0;
	return steganos.stringToBytes(request.responseText, true);
};
