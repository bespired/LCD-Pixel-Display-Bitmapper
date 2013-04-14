



function ui_setup(){

	document.getElementById('fileSelect').addEventListener('change', handleFileSelect, false );
	document.getElementById('bprint').addEventListener('click',  toArduinoArray, false );
		
}

function get_ui_sizes(){
	width  = $( "#width" ).val();
	height = $( "#height" ).val();
}


// From http://blog.ivank.net/floyd-steinberg-dithering-in-javascript.html
function floydSteinberg( sb, w, h ){   // source buffer, width, height

   for(var i=0; i<h; i++) {
      for(var j=0; j<w; j++) {
         var ci = i*w+j;               // current buffer index
         var cc = sb[ci];              // current color
         var rc = (cc<128?0:255);      // real (rounded) color
         var err = cc-rc;              // error amount
         sb[ci] = rc;                  // saving real color
         if(j+1<w) sb[ci  +1] += (err*8)>>4;  // if right neighbour exists
         if(i+1==h) continue;   // if we are in the last line
         if(j  >0) sb[ci+w-1] += (err*3)>>4;  // bottom left neighbour
                   sb[ci+w  ] += (err*5)>>4;  // bottom neighbour
         if(j+1<w) sb[ci+w+1] += (err*1)>>4;  // bottom right neighbour
      }
	}
	return sb;
}

function handleFileSelect ( e ) {
	var files         = e.target.files;
	var fileReader    = new FileReader();

	fileReader.onload = function (e) {
		originalImage = e.target.result;
	
		var img = new Image();
			img.onload = function(){
				
				get_ui_sizes();
				
				var src_x= 0;
				var src_y= 0;
				var src_w= img.width;
				var src_h= img.height;
				can.width  = width;
				can.height = height;
				
				if ( ( src_w != width ) || ( src_h != height ) ){
					// crop image if its bigger in height
					var mode= 'fit';
					if ( src_w == src_h ) mode= 'square';
					if ( src_w <  src_h ) mode= 'small';
					if ( src_w >  src_h ) {
						if ( ( src_w / src_h ) > ( width / height ) ) mode = 'wide'
						if ( ( src_w / src_h ) < ( width / height ) ) mode = 'small'
					}
					switch( mode ){
						case 'square':   // clip off top and bottom
							src_d = src_h;
							src_h = src_h / ( width / height );
							src_y = Math.floor( src_d - src_h ) / 2;
						break;
						case 'wide':
							var f= src_h / height;
							src_d = src_w;
							src_w = f * width;
							src_x = Math.floor( src_d - src_w ) / 2;
						break;			
						case 'small':
							var f= src_w / width;
							src_d = src_h;
							src_h = f * height;
							src_y = Math.floor( src_d - src_h ) / 2;
						break;					
					}
				}
				// draw a ( scaled/cropped ) version to the canvas
				ctx.drawImage( img, src_x, src_y, src_w, src_h ,0, 0, width, height );
			
				var imageData  = ctx.getImageData( 0, 0, width, height);
    			var pixel      = imageData.data;
    			var idx        = 0;
				var buffer     = new Array();
				for ( x=0; x<width; x++ ){	
    			 	for ( y=0; y<height; y++ ){
    			 		a = ( x * height + y ) * 4;
						m = pixel[ a + 0 ] + pixel[ a + 1 ] + pixel[ a + 2 ];
						m = Math.ceil( m / 3 );
						buffer[ idx++ ] = m;
    				}
    			}
    			
				buffer = floydSteinberg( buffer, width, height );
				
				var idx        = 0;
				for ( x=0; x<width; x++ ){	
    			 	for ( y=0; y<height; y++ ){
    			 		a = ( x * height + y ) * 4;
						pixel[ a + 0 ] = pixel[ a + 1 ] = pixel[ a + 2 ] = buffer[ idx++ ];
					}
    			}
	
    			ctx.putImageData( imageData, 0, 0 );
			
			}
		
		img.src = e.target.result;
	}
	
	fileReader.readAsDataURL( e.target.files[0] );

}