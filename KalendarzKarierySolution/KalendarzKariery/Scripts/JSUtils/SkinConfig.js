var SkinConfig = function ()
{
	var self = this;
	var _prefix = "skin-";

	self.applyTheme = function ( themeName )
	{
		$( 'body' ).addClass( themeName );
		$( "#dzHorizontalPaging .dz-horizontal-paging-item" ).addClass( _prefix + 'horizontal-paging-item' );
		$( "#dzVerticalPaging .dz-vertical-paging-item" ).addClass( _prefix + 'vertical-paging-item' );
	}
};




