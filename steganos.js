var steganos = {};

steganos.HEADER_START = 4; 	// 	00000100
steganos.HEADER_END = 6; 		// 	00000110
steganos.CHUNK_START = 8;		// 	00001000
steganos.CHUNK_END = 10;		// 	00001010
steganos.CHUNK_SIZE = 12;		//  00001100

steganos.bytesToString = function(byteArray){
	var string = "";
	for(var i = 0; i < byteArray.length; ++i){
		string += String.fromCharCode(byteArray[i]);
	};
	return string;
};

steganos.stringToBytes = function(string){
	var bytes = [];
	for(var i = 0; i < string.length; ++i){
		bytes.push(string.charCodeAt(i));
	}
	return bytes;
};

steganos.bytesToBase64 = function(byteArray){
	return window.btoa(steganos.bytesToString(byteArray));
};
