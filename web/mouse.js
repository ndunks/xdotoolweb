var DEBUG_MOUSE = DEBUG,
	DEBUG_MOUSE_EL,
	MOUSEPAD	= document.getElementById('mousepad'),
	MOUSESCROLL	= document.getElementById('mousescroll'),
	CURSOR_STATE = 0,
	//MIN_MOVEMENT = 2,
	LAST_CLICK,
	LAST_CLICK_BTN,
	CLICK_COUNT	= 0,
	MIN_CLICK_TIME = 250,
	LAST_TOUCH	= {X: 0, Y: 0};

if( DEBUG_MOUSE )
	DEBUG_MOUSE_EL	= document.getElementById('mouselog');
else document.getElementById('mouselog').remove();

function mouselog(txt)
{
	if(!DEBUG_MOUSE) return;
	DEBUG_MOUSE_EL.innerText = txt.toString();
	//console.log(txt);
}

function mouseDown(e)
{
	log('down',e);
	if(e.button == 0){
		CURSOR_STATE = 1;
		LAST_CLICK = e.timeStamp;
		LAST_CLICK_BTN	= e.button;

		mouselog('startmove');
	}
	
}

function mouseUp(e)
{
	mouselog('up');
	var stamp = e.timeStamp - LAST_CLICK;
	if( stamp <= MIN_CLICK_TIME && LAST_CLICK_BTN == e.button)
	{
		CLICK_COUNT++;
		setTimeout(fireClick, MIN_CLICK_TIME)
	}else{
		CLICK_COUNT = 0;
	}

	LAST_CLICK = undefined;
	CURSOR_STATE = 0;
}

function fireClick()
{
	if(LAST_CLICK != undefined || !CLICK_COUNT || LAST_CLICK_BTN == undefined)
		return;

	log('fireClick', CLICK_COUNT);
	if(CLICK_COUNT > 1)
	{
		WS.send('E' + (LAST_CLICK_BTN+1) ) // double click
	}else{
		WS.send('C' + (LAST_CLICK_BTN+1) )
	}
	CLICK_COUNT = 0;
}

function mouseLeave(e)
{
	mouselog('leave');
	LAST_CLICK = undefined;
	CLICK_COUNT = 0;
	CURSOR_STATE = 0;
}

function mouseMove(e)
{
	if(!CURSOR_STATE
		|| !(e.movementX || e.movementY) )
		return;
	mouselog([e.movementX,e.movementY]);
	log(e.movementX,e.movementY);
	WS.send('M-- ' + calculateMovement(e.movementX, e.movementY));
}

// Mouse Pad Touch
function touchStart(e)
{
	e.preventDefault();
	e.stopPropagation();

	log('touchStart');
	LAST_TOUCH.X	= e.touches[0].pageX;
	LAST_TOUCH.Y	= e.touches[0].pageY;
	LAST_CLICK = e.timeStamp;
	LAST_CLICK_BTN	= e.touches.length - 1;

	CURSOR_STATE = 1;
	e.preventDefault();
	e.stopPropagation();
}

function touchEnd(e)
{
	e.preventDefault();
	e.stopPropagation();

	log('touchEnd', e);
	var stamp = e.timeStamp - LAST_CLICK;
	var button	= e.changedTouches.length - 1;
	if( stamp <= MIN_CLICK_TIME && LAST_CLICK_BTN == button)
	{
		CLICK_COUNT++;
		setTimeout(fireClick, MIN_CLICK_TIME)
	}else{
		CLICK_COUNT = 0;
	}

	LAST_CLICK = undefined;
	CURSOR_STATE = 0;

}

function touchMove(e)
{
	e.preventDefault();
	e.stopPropagation();

	var movementX	= e.touches[0].pageX - LAST_TOUCH.X;
	var movementY	= e.touches[0].pageY - LAST_TOUCH.Y;


	if(!movementX && !movementY)
		return;
	LAST_CLICK_BTN = undefined;
	LAST_TOUCH.X	= e.touches[0].pageX;
	LAST_TOUCH.Y	= e.touches[0].pageY;
	mouselog([movementX,movementY]);
	
	WS.send('M-- ' + calculateMovement(movementX, movementY));
}

// Mouse Scroll Touch
function touchScrollStart(e)
{
	e.preventDefault();
	e.stopPropagation();

	log('touchScrollStart');
	LAST_TOUCH.X	= e.touches[0].pageX;
	LAST_TOUCH.Y	= e.touches[0].pageY;

	CURSOR_STATE = 1;
}

function touchScrollEnd(e)
{
	e.preventDefault();
	e.stopPropagation();
	log('touchScrollEnd', e);
	CURSOR_STATE = 0;
}

function touchScrollMove(e)
{
	e.preventDefault();
	e.stopPropagation();

	var movementY	= e.touches[0].pageY - LAST_TOUCH.Y;

	if(Math.abs(movementY) >= 5){
		LAST_TOUCH.X	= e.touches[0].pageX;
		LAST_TOUCH.Y	= e.touches[0].pageY;
		WS.send('K' + (movementY > 0 ? 'Down' : 'Up'));
		//WS.send('K' + (movementY > 0 ? 'Pointer_Up' : 'Pointer_Down'));
	}
}

function calculateMovement(x,y)
{
	var tX = Math.abs(x),
		tY = Math.abs(y),
		multiply = 1;

	if(tX > 20 || tY > 20)
		multiply = 5;
	else if(tX > 15 || tY > 15)
		multiply = 4;
	else if(tX > 10 || tY > 10)
		multiply = 3;
	else if(tX > 5 || tY > 5)
		multiply = 2;

	return (x * multiply) + ' ' + (y * multiply);
}

MOUSEPAD.onmousedown = mouseDown;
MOUSEPAD.onmousemove = mouseMove;
MOUSEPAD.onmouseup = mouseUp;
MOUSEPAD.onmouseleave = mouseLeave;


MOUSEPAD.ontouchstart = touchStart;
MOUSEPAD.ontouchmove = touchMove;
MOUSEPAD.ontouchend = touchEnd;

MOUSESCROLL.ontouchstart = touchScrollStart;
MOUSESCROLL.ontouchmove = touchScrollMove;
MOUSESCROLL.ontouchend = touchScrollEnd;