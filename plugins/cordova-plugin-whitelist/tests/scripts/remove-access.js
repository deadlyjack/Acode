var fs = require('fs');
var path = require('path');
var rootdir = "";
var file = path.join(rootdir, "platforms/android/app/src/main/res/xml/config.xml");

fs.readFile( file, "utf8", function( err, data )
{
    if (err)
        return console.log( err );

    var result = data;
    result = result.replace( "<access origin=\"*\" />", "" );

    fs.writeFile( file, result, "utf8", function( err )
    {
        if (err)
            return console.log( err );
    } );
} );