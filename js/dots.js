

// size =  96x65
var byte   = new Array();
var height = 65;
var width  = 96;

function clearBuffer(){
	var count = 0;
	for ( var rows = 0; rows < height / 8; rows++ ){
		for ( var bytes = 0; bytes < width ; bytes++ ){
			byte[ count++ ] = 0;
		}
	}
}

function bit2Byte(){
	var mul   = [ 1,2,4,8,16,32,64,128 ];
	var rows  = Math.ceil( height / 8 );
	for( r = 0; r < rows; r++ ){
		var r8= r*8;
		for( x = 0; x < width; x++ ){
			var byt = 0;
			for ( y = 0; y < 8; y++ ){
				var imgData = ctx.getImageData( x , r8 + y , 1, 1);
				red         = imgData.data[0];
				//green = imgData.data[1];
				//blue  = imgData.data[2];
				//alpha = imgData.data[3];
				var bit = ( red > 127 ) ? 0 : 1;
				byt = byt + mul[y] * bit;
			}
			byte[ x + r * width ] = byt;
		}
	}	
}


function arduinoArray(){

	bit2Byte();

	var row   = "";
	var count = 0;
	var rows  = Math.ceil( height / 8 );
	var html  = "uchar lcd_buffer[ # ] = { \n";
	for ( var rows = 0; rows < height / 8; rows++ ){
		for ( var bytes = 0; bytes < width ; bytes++ ){
			row  += byte[ count++ ] + ",";
			if ( row.length > 72 ){
				html += row + "\n";
				row  = "";
			}
	
		}
	}
	if ( row.length == 0 ) row = " ";
	html += row.substr( 0, row.length - 1 ) + "  };" ;
	html = html.replace( "#", count );
	
	var w=window.open("", "newwin", "height=450, width=650,toolbar=no,scrollbars="+scroll+",menubar=no");
	$( w.document.body ).html( "<pre>" + html + "</pre>" );

}