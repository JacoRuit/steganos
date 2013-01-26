steganos.Image = function(image){
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	this.canvas.width = image.width;
	this.canvas.height = image.height;
	this.context.drawImage(image, 0, 0);
	this.bytes = this.context.getImageData(0, 0, image.width, image.height);
	this.original = this.bytes;
	this.chunks = {};
};

steganos.Image.prototype.getHeaderBytes = function(){
	var bytes = [steganos.HEADER_START];
	for(var chunk in this.chunks){
		bytes.push(steganos.CHUNK_START);
		bytes = bytes.concat(steganos.stringToBytes(chunk));
		bytes.push(steganos.CHUNK_END);
	}
	bytes.push(steganos.HEADER_END);
	return bytes;
};


steganos.Image.prototype.allocChunk = function(name, bytes){
	this.chunks[name] = bytes;
};

steganos.Image.prototype.deallocChunck = function(name){
	delete this.chuncks[name];
};

steganos.Image.prototype.write = function(){
	var header = this.getHeaderBytes();
	for(var i = 0; i < this.original.data.length; ++i){
		this.bytes.data[i] = this.original.data[i];
	}
	var pos = this.writeBytes(0, header);
	//console.log(pos, header);
	for(var chunk in this.chunks){
		//console.info(pos);
		pos = this.writeByte(pos, steganos.CHUNK_START);
		pos = this.writeBytes(pos, this.chunks[chunk]);
		pos = this.writeByte(pos, steganos.CHUNK_END);
		//console.log(pos);
	}
	this.flush();
};

steganos.Image.prototype.writeByte = function(pos, byte){
	if(byte > 255) throw "This isn't a byte";
	//console.info("Writing ", byte, "(", byte.toString(2) ,") at ", pos);
	for(var i = 0; i < 8; ++i){	
		if(byte & 1 == 1)
			this.bytes.data[pos + i] |= 1; 
		else	
			this.bytes.data[pos + i] &= ~1; 
		//console.log(byte.toString(2), this.bytes.data[pos + i].toString(2));
		byte >>= 1;
	}
	return pos + 8;
};

steganos.Image.prototype.writeBytes = function(pos, bytes){
	//console.log(pos);
	for(var i = 0; i < bytes.length; ++i){
		pos = this.writeByte(pos, bytes[i]);
	}
	return pos;
};

steganos.Image.prototype.read = function(){
	var bytes = this.readBytes(0, (this.canvas.width * this.canvas.height - 8) / 8);
	var bytePos = null;	for(var i = 0; i < bytes.length; ++i){
		if(bytes[i] == steganos.HEADER_START) bytePos = i + 1;
	}
	if(bytePos == null) throw "Invalid steganos image";
	var byte = bytes[bytePos];
	var inChunk = false;
	var chunkNameBytes = [];
	this.chunks = {};
	var chunkOrder = [];
	while(byte != steganos.HEADER_END && byte != undefined){	
		if(byte == steganos.CHUNK_START && !inChunk){
			chunkNameBytes = [];
			inChunk = true;
		}else if(byte == steganos.CHUNK_END && inChunk){ 
			var chunkName = steganos.bytesToString(chunkNameBytes);
			this.chunks[chunkName] = null;
			chunkOrder.push(chunkName);
			inChunk = false;
		}else if(inChunk)
			chunkNameBytes.push(byte);
		byte = bytes[++bytePos];
	}
	for(var chunk in this.chunks){
		byte = bytes[++bytePos];
		if(byte != steganos.CHUNK_START) return;
		var chunkBytes = [];
		while(byte != steganos.CHUNK_END && byte != undefined) {
			byte = bytes[++bytePos];
			chunkBytes.push(byte);
		}
		this.chunks[chunk] = chunkBytes;
	};
	//console.log(this.chunks);
};	

steganos.Image.prototype.readByte = function(pos){
	//console.info("Reading byte at ", pos);
	var byte = 0;
	for(var i = 0; i < 8; ++i){
		if(this.bytes.data[pos + i] & 1 == 1)
			byte |= Math.pow(2, i);
		//console.log(this.bytes.data[pos + i].toString(2), (this.bytes.data[pos + i] & 1), byte.toString(2));
	}
	return byte;
};

steganos.Image.prototype.readBytes = function(pos, count){
	var bytes = [];
	for(var i = 0; i < count; ++i){
		bytes.push(this.readByte(pos + i * 8));
	}
	return bytes;
};


steganos.Image.prototype.flush = function(){
	this.canvas.width = this.canvas.width;
	this.context.putImageData(this.bytes, 0, 0);
	this.bytes = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
};

steganos.Image.prototype.getDataUri = function(format){
	//return "data:image/png;base64," + steganos.bytesToBase64(this.bytes.data);
	this.flush();
	return this.canvas.toDataURL(format);
};
