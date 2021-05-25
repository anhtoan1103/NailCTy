jQuery(document).ready(function($) {
	"use strict";
	/* pretty photo */

    $("#about_carousel").owlCarousel({
        // loop:true,
        margin:30,
        nav:true,
        navContainerClass: 'carousel-nav-btn-gc',
        navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
        navClass: ['carousel-nav-left','carousel-nav-right'],
        dots:false,
        responsive:{
            0:{
                items:1
            },
            760:{
                items:1
            },
            1000:{
                items:1
            }
        }
    });
	/* Show search at top */
    $("#header-widget-search").click(function(){
        $("#cms-search").toggleClass('open');
        $("#cms-search input[type='text']" ).focus();
    });
    $("#header-widget-search-close").click(function(){
        $("#cms-search").removeClass('open');
    });

    /* Show Main Navigation for Header v4*/
    $("#cms-show-mainnav").click(function(){
        $("#cms-mainnav-v4").toggleClass('open');
    });
    $("#cms-hide-mainnav").click(function(){
        $("#cms-mainnav-v4").removeClass('open');
    });
    /*////////////// MOBILE NAV ///////////////*/
	$('.mobile-menu nav').meanmenu({
        meanMenuContainer: '.menu_mobile_v1',
        meanScreenWidth: "1366",
        meanRevealPosition: "right",
        meanMenuOpen: "<span></span>"
    });
    /*////////////// GALLERY ///////////////*/
    var groups = {};
    $('.gallery-item').each(function() {
      var id = parseInt($(this).attr('data-group'), 10);      
      if(!groups[id]) {
        groups[id] = [];
      }       
      groups[id].push( this );
    });


    $.each(groups, function() {
      
      $(this).magnificPopup({
          type: 'image',
          closeOnContentClick: true,
          closeBtnInside: true,
          gallery: { enabled:true }
      })
      
    });
    /*////////////// BOOKING ///////////////*/
    $(document).ready(function() {
      // $('#datetimepicker_v1').datetimepicker();
    });



    $( '#my-slider' ).sliderPro({

        width: 1976,
        height:800,
        arrows: true,
        fade: true,
        autoHeight:true,
        centerImage:true,
        autoScaleLayers: false,
        fadeArrows:true,
        buttons: true,
        thumbnailArrows: false,
        autoplay: true,
        slideSpeed : 300,
        autoDelay:4000,
        breakpoints: {
            768: {
                width: 1024,
                height:600,
                arrows: false,
                fade: true,
                autoHeight:true,
                centerImage:false,
                autoScaleLayers: false,
                forceSize: 'fullWidth',
                buttons: false,
                thumbnailArrows: true,
                autoplay: true,
                slideSpeed : 300,

            }
        },
    });


    $( '#sale-slider' ).sliderPro({
        width:"100%",
        height:535,
        arrows: true,
        buttons: true,
        autoplay:true,
        autoplayDelay:3000,
        orientation:"vertical",
        breakpoints: {
            990: {width: '100%',height:535},
            480: {width: '100%',height:435}

        }
    });
});