(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });


    // Related carousel
    $('.related-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });


    // Product Quantity
    $('.quantity button').on('click', function () {
        var button = $(this);
        var oldValue = button.parent().parent().find('input').val();
        if (button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        button.parent().parent().find('input').val(newVal);
    });
    
})(jQuery);

function drawVisor() {
  const canvas = document.getElementById("visor");
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.moveTo(5, 45);
  ctx.bezierCurveTo(15, 64, 45, 64, 55, 45);

  ctx.lineTo(55, 20);
  ctx.bezierCurveTo(55, 15, 50, 10, 45, 10);

  ctx.lineTo(15, 10);

  ctx.bezierCurveTo(15, 10, 5, 10, 5, 20);
  ctx.lineTo(5, 45);

  ctx.fillStyle = "#2f3640";
  ctx.strokeStyle = "#f5f6fa";
  ctx.fill();
  ctx.stroke();
}

const cordCanvas = document.getElementById("cord");
const ctx = cordCanvas.getContext("2d");

let y1 = 160;
let y2 = 100;
let y3 = 100;

let y1Forward = true;
let y2Forward = false;
let y3Forward = true;

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  ctx.beginPath();
  ctx.moveTo(130, 170);
  ctx.bezierCurveTo(250, y1, 345, y2, 400, y3);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 8;
  ctx.stroke();

  if (y1 === 100) {
    y1Forward = true;
  }

  if (y1 === 300) {
    y1Forward = false;
  }

  if (y2 === 100) {
    y2Forward = true;
  }

  if (y2 === 310) {
    y2Forward = false;
  }

  if (y3 === 100) {
    y3Forward = true;
  }

  if (y3 === 317) {
    y3Forward = false;
  }

  y1Forward ? (y1 += 1) : (y1 -= 1);
  y2Forward ? (y2 += 1) : (y2 -= 1);
  y3Forward ? (y3 += 1) : (y3 -= 1);
}

drawVisor();
animate();

