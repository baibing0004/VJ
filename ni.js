VJ.merge(VJ.getValue(window.top.ni,{}),{
	Ni:{
		ajaxtest11:{command:'http://localhost/VESHTest/Module/help/test.tjsonp?_n=recorder',dbtype:'tjson',params:{limit:11},template:'template2'},
		ajaxtest1:{command:'http://localhost/KDAPI/Module/GetOrderTrackItems.tjsonp?_n=Order',dbtype:'tjson',params:{},template:'template21'},
		'ajaxtest1.Cache':{},
		'ajaxtest1.Set':{},
		sqlinsert:{command:'create table if not exists table1(name Text,message text,time integer);insert into table1 values(?,?,?);',dbtype:'json',params:{data:[]},template:'sqltemp'},
		sqlselect:{command:'select * from table1;',dbtype:'json',params:{data:[]},template:'sqltemp'},
		sqlselect2:{command:'select * from table1 where name=?',dbtype:'json',params:{data:[]},template:'sqltemp'}
	}
},true);