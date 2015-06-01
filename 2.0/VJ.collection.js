(function(V,$){
	V.collection = {};
	var C = V.collection;
	//实现对池类型的管理
	C.Pool = function(size,func,waitTime){
		var _ = this;
		var __ = {};
		{	
			//总数 可用 已用
			__.data = [];
			__.have = [];
			__.use = {};
			__.KEY = '_____poolid';
			__.addUse = function(v){
				if(v){
					if(!V.isValid(v[__.KEY])){
						v[__.KEY] = V.random();
					}
					__.use[v[__.KEY]]=v;
				}
			};
			__.delUse = function(v){
				if(v){
					if(V.isValid(v[__.KEY]) && V.isValid(__.use[v[__.KEY]])){
						delete __.use[v[__.KEY]]
					}
				}
			};		
			waitTime = V.getValue(waitTime,10);
			__.clearer = new function(){
				var _ = this;
				{
					var tid = null;
					_.start = function(){
						tid = window.setTimeout(function(){
							var endDate = __.have.length>0?__.have[0].endDate:null;
							if(V.isValid(endDate) && new Date().diff('ms',endDate)>0){
								_.start();
							} else {
								while(__.have.length>0){
									var val = __.have.shift();
									if(val.dispose){
										val.dispose();
										val = null;
									}
								}								
								__.data = [];
								for(var i in __.use){
									__.data.push(__.use[i]);
								}
								_.start();								
							}
						},500);
					};
					_.stop = function(){
						if(tid){
							window.clearTimeout(tid);
						}
						tid = null;
					};
				}
			};
			__.clearer.start();			
		}
		_.getValue = function(){
			var v = __.have.pop();
			if(v){
				v = v.value;
				__.addUse(v);
				return v;
			} else if(__.data.length<size){
				v = func();
				__.addUse(v);
				__.data.push(v);
				return v;
			} else return null;
		};
		_.setValue = function(v){
			__.delUse(v);
			if(V.isValid(v) && V.isValid(v[__.KEY])){
				__.have.push({endDate:new Date().add('s',waitTime),value:v});
			}
		};
		_.dispose = function(){
			__.clearer.stop();
			while(__.have.length>0){
				var val = __.have.shift();				
				if(val.dispose){
					val.dispose();
					val = null;
				}
			}			
			__.data = [];
			for(var i in use){
				__.data.push(use[i]);
			}
		};
	};
})(VJ,jQuery);
