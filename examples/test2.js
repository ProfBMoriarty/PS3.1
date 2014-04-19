// Pattern for later files

T = ( function ( t )
{
	var _sys = t._sys = t._sys || {}; // establish _sys

	t.init = function ()
	{
		for ( p in t )
		{
			if ( t.hasOwnProperty( p ) )
			{
				delete p;
			}
		}
		console.log( "val = " + T.val + ", _sys.foo = " + _sys.foo + "\n" );
	};

	return t;
} ( T ) );

