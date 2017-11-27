const RNDSCALE = 200;
const ANIMTIME = 3000;
var running = 0;

$("head").append("<style>"+
  ".left{transform:scaleX(-1);}"+
  ".bigger{transform:scale(1.5);}"+
  ".left.bigger{transform:scale(-1.5,1.5);}"+
  "</style>"); //I didn't touch the CSS
  $("#fish1Id").attr("x",1);
  $("#fish1Id").attr("y",0);
  $("#fish2Id").attr("x",1);
  $("#fish2Id").attr("y",0);

function colliding(first,second){
  if ((first.offset().top + first.height()) < second.offset().top ||
        first.offset().top > (second.offset().top + second.height()) ||
        (first.offset().left + first.width()) < second.offset().left  ||
        first.offset().left > (second.offset().left + second.width()))
        return false;
    return true;
}

function transformFish(fish,x,y){
  var start = Math.atan(fish.attr("y")/fish.attr("x"));
  fish.attr("x",x);
  fish.attr("y",y);
  $({rad:start}).animate({rad:Math.atan(y/x)},{
    duration:300,
    step: function(curr){
      fish.css("transform","rotate("+
        curr+"rad) "+
        "scale("+((fish.hasClass("bigger")?1.5:1)
          *(fish.hasClass("left")?-1:1))+","+
          (fish.hasClass("bigger")?1.5:1)+")")
    }
  });
}

function randMoves(fish){
  var rnd = Math.random(); //computed just once
  var topShift = Math.cos(6.3*rnd)*RNDSCALE;
  var leftShift = Math.sin(6.3*rnd)*RNDSCALE;
  if(fish.offset().top+fish.height()+topShift>$(window).height()
    || fish.offset().top+topShift<0)
    topShift *= -1;
  if(fish.offset().left+fish.width()+leftShift>$(window).width()
    || fish.offset().left+leftShift<0)
    leftShift *= -1;
  if(leftShift<0)
    fish.addClass("left");
  else
    fish.removeClass("left");
  transformFish(fish,leftShift,topShift);
  var speed = running?7:1;
  fish.animate({top:"+="+topShift,left:"+="+leftShift},
    (ANIMTIME+ANIMTIME*rnd)/speed,"linear",function(){randMoves(fish)});
}

function goingUp(bubble){
  bubble.stop(1);
  bubble.fadeIn();
  bubble.removeClass("pop");
  bubble.offset({top:$(window).height(),
    left:Math.random()*($(window).width()-bubble.width())});
  bubble.animate({top:-bubble.width()},10000,"linear",
    function(){goingUp(bubble)});
}

$(".bubbleClass").each(function(i){
  $(this).delay(i*2000).animate({},function(){goingUp($(this))});
});

$("[id*=fish]").animate({},function(){ randMoves($(this)) });

$(window).click(function(pos){
  let fish = $("#fish1Id");
  if(pos.pageY>fish.offset().top 
    && pos.pageY<fish.offset().top+fish.height() 
    && pos.pageX>fish.offset().left 
    && pos.pageX<fish.offset().left+fish.width())
    return;
  let move = {top:pos.pageY-fish.height()/2,
    left:pos.pageX-fish.width()/2};
  if(move.top>$(window).height()-fish.height())
    move.top-=fish.height()/2;
  if(move.left>$(window).width()-fish.width())
    move.left-=fish.width()/2;
  if(move.left<fish.offset().left)
    fish.addClass("left")
  else
    fish.removeClass("left");
  transformFish(fish,move.left-fish.offset().left,
    move.top-fish.offset().top);
  fish.stop(1);
  fish.animate(move,{duration:1000,queue:true,
    complete:function(){randMoves(fish)}});
});

$("#fish1Id").dblclick(function(){
  fish=$(this);
  fish.addClass("bigger");
  transformFish(fish,fish.attr("x"),fish.attr("y"));
  setTimeout(function(){ fish.removeClass("bigger");transformFish(
    fish,fish.attr("x"),fish.attr("y")) },2000);
  //.delay(2000).removeClass("bigger"); //was not working
});

setInterval(function(){
  var fish1 = $("#fish1Id");
  var fish2 = $("#fish2Id");
  $(".bubbleClass").each(function(){
    if($(this).hasClass("pop"))
      return;
    if(colliding($(this),fish1)
      || colliding($(this),fish2))
      $(this).fadeOut(function(){$(this).addClass("pop");
        goingUp($(this))});
  });
  if(colliding(fish1,fish2)){
    fish1.attr("src",'images/fish1_angry.png');
    fish2.attr("src",'images/fish2_angry.png');
    if(!running){
      running=1;
      fish1.stop(1);
      fish2.stop(1);
      fish1.animate({},function(){randMoves(fish1)});
      fish2.animate({},function(){randMoves(fish2)});
    }
  } else {
    running=0;
    fish1.attr("src",'images/fish1.png');
    fish2.attr("src",'images/fish2.png');
  }
},100);

$("#fish2Id").mouseenter(function(){
  let move = {top:Math.random()*($(window).height()-$(this).height()),
    left:Math.random()*($(window).width()-$(this).width())};
  if(move.left<$(this).offset().left)
    $(this).addClass("left");
  else
    $(this).removeClass("left");
  transformFish($(this),move.left-$(this).offset().left,
    move.top-$(this).offset().top);
  $(this).stop(1);
  $(this).animate(move,700,function(){randMoves($(this))});
});