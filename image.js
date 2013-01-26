steganos.Image = function(bytes){
	this.bytes = bytes;
	this.chunks = {};
	this.offset = Math.floor(this.bytes.length / 8) * 8 / 2;
	this.capicity = this.offset / 8; 
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
	var saved = 0;
	var pos = this.offset;
	pos = this.writeBytes(pos, header);
	saved += header.length;
	for(var chunk in this.chunks){
		if(saved + 2 + this.chunks[chunk].length > this.capicity){
			throw "Too much data, can't save chunk: " + chunk;
		}
		pos = this.writeByte(pos, steganos.CHUNK_START);
		pos = this.writeBytes(pos, this.chunks[chunk]);
		pos = this.writeByte(pos, steganos.CHUNK_END);
	}
};

steganos.Image.prototype.writeByte = function(pos, byte){
	if(byte > 255) throw "This isn't a byte";
	for(var i = 0; i < 8; ++i){	
		if(byte & 1 == 1)
			this.bytes[pos + i] |= 1; 
		else	
			this.bytes[pos + i] &= ~1; 
		byte >>= 1;
	}
	return pos + 8;
};

steganos.Image.prototype.writeBytes = function(pos, bytes){
	for(var i = 0; i < bytes.length; ++i){
		pos = this.writeByte(pos, bytes[i]);
	}
	return pos;
};

steganos.Image.prototype.read = function(){
	var bytes = this.readBytes(this.offset, this.capicity);
	var bytePos = null;	for(var i = 0; i < bytes.length; ++i){
		if(bytes[i] == steganos.HEADER_START){
			bytePos = i + 1;
			break;
		}
	}
	if(bytePos == null) throw "Invalid steganos image";
	var byte = bytes[bytePos];
	var inChunk = false;
	var chunkNameBytes = [];
	this.chunks = {};
	while(byte != steganos.HEADER_END && byte != undefined){	
		if(byte == steganos.CHUNK_START && !inChunk){
			chunkNameBytes = [];
			inChunk = true;
		}else if(byte == steganos.CHUNK_END && inChunk){ 
			var chunkName = steganos.bytesToString(chunkNameBytes);
			this.chunks[chunkName] = null;
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
};	

steganos.Image.prototype.readByte = function(pos){
	var byte = 0;
	for(var i = 0; i < 8; ++i){
		if(this.bytes[pos + i] & 1 == 1)
			byte |= Math.pow(2, i);
	}
	return byte;
};

steganos.Image.prototype.readBytes = function(pos, max){
	var bytes = [];
	for(var i = 0; i < max; ++i){
		bytes.push(this.readByte(pos + i * 8));
	}
	return bytes;
};

steganos.Image.prototype.getDataUri = function(format){
	return steganos.DATA_URI_JPG_START + steganos.bytesToBase64(this.bytes);
};
