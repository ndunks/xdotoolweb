log('keyboard.js');
var KEYBOARD	= document.getElementById('keyboard'),
	SHIFT_STATE	= 0,
	CAPS_ON		= false,

	KEYTRANSATE	= {},
	KEYBOARD_FUNCTION = 
{
	"shift"	: keyboardToggleShift,
	"caps"	: keyboardToggleCapslock
};
	// Handle special function
	// Store code that label and code not same


function keyboardButtonClick(e)
{
	//find the parent btn
	e.stopPropagation();
	e.preventDefault();
	var btn = e.target, step = 0;

	while(!btn.dataset.label && step < 5){
		step++;
		btn = btn.parentNode;
	}

	var label, code, which;

	which	= btn.dataset.shift && SHIFT_STATE ? 'shift' : 'label';
	label	= btn.dataset[which];
	code	= btn.dataset[which+'_code'] || label;

	console.log('btn: ' + label);

	//Check predefined function
	if( KEYBOARD_FUNCTION [label] )
	{
		KEYBOARD_FUNCTION [label].apply(btn);
	}else{
		//After keypress

		WS.send('K' + code);
		if( SHIFT_STATE == 1)
		{
			keyboardSetShiftButton(0);
		}
	}
}

function keyboardToggleShift()
{
	keyboardSetShiftButton( SHIFT_STATE >= 2 ? 0 : ++SHIFT_STATE , this)
	console.log('Toggle shift: ' + SHIFT_STATE);
}

function keyboardSetShiftButton( state, el )
{
	el = el || document.querySelectorAll('[data-label="shift"]')[0];
	if( state > 0)
	{
		el.classList.add( (state == 1) ? 'on' : 'keep' );
		if(state == 1)
		{
			keyboardSetShiftState(true);
		}
	}else{
		el.classList.remove('keep', 'on');
		keyboardSetShiftState(false);
	}
	SHIFT_STATE = state;

}

function keyboardToggleCapslock()
{

	if( (CAPS_ON = !CAPS_ON) )
	{
		this.classList.add('keep');
		keyboardLetterSetUpperCase(true);
	}else{
		this.classList.remove('keep');
		keyboardLetterSetUpperCase(false);
	}
}

function keyboardLetterSetUpperCase(upper)
{
	var call = upper ? 'toUpperCase' : 'toLowerCase';

	Array.from(document.querySelectorAll("[data-label_letter]")).forEach(function(self, i){
		
		self.dataset.label = self.dataset.label[call]();

		for(var i = 0; i < self.childNodes.length; i++ )
		{
			if( self.childNodes[i].classList.contains('label') )
			{
				self.childNodes[i].innerText = self.dataset.label;
				break;
			}
		}
	})
}

function keyboardSetShiftState( state )
{
	keyboardLetterSetUpperCase( state );
	Array.from(document.querySelectorAll("[data-shift]")).forEach(function(self,i){
		for(var i = 0; i < self.childNodes.length; i++ )
		{
			if( self.childNodes[i].classList.contains('label') )
			{
				self.childNodes[i].innerText = state ? self.dataset.shift : self.dataset.label;
			}

			if( self.childNodes[i].classList.contains('shift') )
			{
				if( state )
					self.childNodes[i].classList.add('hide');
				else self.childNodes[i].classList.remove('hide');
			}
		}
	})

}
function keyboardMakeDisplay(charmap, kind) // kind label | shift
{
	var el = document.createElement('div'), kb_label, kb_code;

	el.setAttribute('class', kind);
	if( typeof(charmap) == 'object' )	
	{
		kb_code	= Object.keys(charmap)[0];
		kb_label		= charmap[kb_code];
	}else{
		kb_label = kb_code = charmap;
	}
	el.innerHTML = kb_label;
	this.setAttribute('data-' + kind, kb_label);

	if(	kb_label.length == 1 
		&& kb_label.charCodeAt(0) >= 97 // a 
		&& kb_label.charCodeAt(0) <= 122 // z
	){
		this.setAttribute('data-' + kind + '_letter', 1);
	}
	if(kb_code){
		this.setAttribute('data-' + kind + '_code', kb_code);
	}
	//Widht config
	if(KEYBOARD_BUTTON_STYLE[kb_code])
	{
		this.setAttribute('style', KEYBOARD_BUTTON_STYLE[kb_code]);
	}
	this.appendChild(el);
}

// log('Keyboard: Displaying button')
//Displaying buttons
for( var btn_group_index in KEYBOARD_BUTTON )
{
	var container	= document.createElement('div');
	container.setAttribute('class', 'btn-row');
	var btn_group	= KEYBOARD_BUTTON[ btn_group_index ];
	for( var btn_index in btn_group )
	{
		var btn	= btn_group[ btn_index ];
		var btn_el	= document.createElement('button');
		//var labels;

		btn_el.setAttribute('class', 'btn');
		btn_el.setAttribute('type', 'button');
		//log(typeof(btn_el.append))
		if( typeof(btn) == 'object' && btn.length )
		{
			keyboardMakeDisplay.call(btn_el, btn[0], 'label');
			keyboardMakeDisplay.call(btn_el, btn[1], 'shift');

		}else{
			keyboardMakeDisplay.call(btn_el, btn, 'label');
		}


		btn_el.onclick = keyboardButtonClick;
		container.appendChild(btn_el);
	}
	KEYBOARD.appendChild( container );

}
// log('Keyboard: Displayed')


