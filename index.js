#!/usr/bin/env node
 
const vorpal = require('vorpal')().show();
const StromDAONode = require('stromdao-businessobject');
const rpcurl="https://fury.network/rpc";

args = f => f.toString ().replace (/[\r\n\s]+/g, ' ').
              match (/(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/).
              slice (1,3).
              join ('').
              split (/\s*,\s*/);

var types = [];
var objects = [];
var cmds=[];

var cliNode = new StromDAONode.Node({external_id:"cli",testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});


function introspect(name,obj) {
	names=Object.getOwnPropertyNames(obj);
	for(var i=0;i<names.length;i++) {	
		if((names[i]!="obj")&&(names[i]!="test")) {
			
			var x= Object.getOwnPropertyDescriptor(obj,names[i]);	
				a=args(x.value);
				var argumentlist=" <extid>";
				for(var j=0;j<a.length;j++) {
						if(a[j].length>0) {												
							if(argumentlist.length>0) argumentlist+=" ";
							argumentlist+="<"+a[j]+">";
							if(typeof types[a[j]] != "Array") types[a[j]]=[];
							//types[a[j]].push(name+"."+names[i]);
							
							
							
						}
				}	
				if(typeof cmds[name+" "+names[i]+""+argumentlist]=="undefined") {								
								cmds[name+" "+names[i]+""+argumentlist]=
								vorpal
									  .command(name+" "+names[i]+""+argumentlist)				  
									  .action(function (args, callback) {
										this.log(args);									
										callback();
								});	
				}
		}
	}			
	objects.push(name);
	
}

function introobject(i,node) {
	var names=Object.getOwnPropertyNames(node);
	i++;	
	
	if(i>=names.length)  {
		console.log("Initialized");
	} else
	if(names[i].indexOf("_")!=0) {
		try{

		
		var n = names[i];
		node[names[i]].apply(this,['0x0000000000000000000000000000000000000008']).then(function(x) {
						introspect(n,x);
						introobject(i,node);
		});
		//introspect(names[i]);	
		} catch(e) {
			introobject(i,node);
		};
	} else {introobject(i,node);}
}

introobject(-1,cliNode);
		
		
vorpal
  .command('account show [extid]')
  .option('--privatekey','Print Private Key.')
  .action(function (args, callback) {
    var node = new StromDAONode.Node({external_id:args.extid,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});
	
    this.log("Address",node.wallet.address);
    if (args.options.privatekey) {
		this.log("PrivateKey",node.wallet.privateKey);
	}
    
    callback();
});	

vorpal
  .command('account import <extid> <privatekey>')  
  .action(function (args, callback) {
    var node = new StromDAONode.Node({external_id:args.extid,privatKey:args.privatekey,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});
	
    this.log("Address",node.wallet.address);    
    
    callback();
});	

		
