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
var instances = [];

var cliNode = new StromDAONode.Node({external_id:"cli",testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});

function introspectCalls(obj,a,parent) {
		var a=vorpal._delimiter.split("/");
		if(vorpal.find("call")) vorpal.find("call").remove("call");
		extid=a[1];		
		
			parent
			.command("call [arguments...]")
			.types({string: ['_']})
			.action(function(args,cb) {					
				var a=vorpal._delimiter.split("/");
				extid=a[1];			
				cliNode = new StromDAONode.Node({external_id:extid,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});														
				cargs=[];
				address=a[3];
				if(address!="0x0") cargs.push(address);

				cliNode[a[2]].apply(this,cargs).then(function(x) {
					margs=args.arguments;
					x[a[4]].apply(this,margs).then(function(tx) {

						if(typeof tx=="object") {
							for (var k in tx){
								if (tx.hasOwnProperty(k)) {
									parent.log(k+":",tx[k].toString());								 
								}
							}						
						} else {
							parent.log(tx);
						}
					});							
				});						
				cb();
			});		
}

function introspectMethods(obj,a,parent) {	
	cargs=[];
	address=a[3];
	if(address!="0x0") cargs.push(address);
	
	obj[a[2]].apply(this,cargs).then(function(x) {
			names=Object.getOwnPropertyNames(x);
			for(var i=0;i<names.length;i++) {
					parent.log("Loading ",parent._delimiter+names[i]+"/");	
					
			}	
			parent
					.command("use <method>")
					.action(function(args,cb) {	
						vorpal.delimiter(vorpal._delimiter+""+args.method+"/");
						var a=vorpal._delimiter.split("/");								
						introspectCalls(obj,a,parent);			
						cb();
				});
	});		
	
}

function introobject(i,node,parent) {
	var names=Object.getOwnPropertyNames(node);
	i++;	
	if(i>=names.length)  {
		return;
		//parent.show();
	} else
	if(names[i].indexOf("_")!=0) {
		parent.log("Loading ",parent._delimiter+"/"+names[i]+"/");			
        introobject(i,node,parent);
	
	} else {
		introobject(i,node,parent);
	}
}



vorpal
  .command('use [extid]')  
  .action(function (args, callback) {
    cliNode = new StromDAONode.Node({external_id:args.extid,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});
	
    vorpal
	.delimiter("/"+args.extid)
	.show();
	instances=[];
    introobject(-1,cliNode,vorpal);

    if(vorpal.find("use")) vorpal.find("use").remove("use");
    
	vorpal
	.command("use <instance>")
	.option("-a <address>")
	.types({
		string: ['a']
	})
	.action(function(args,cb) {	
			if(!args.options.a) args.options.a="0x0";			
			
			vorpal
			.delimiter(vorpal._delimiter+"/"+args.instance+"/"+args.options.a+"/");
			if(vorpal.find("use")) vorpal.find("use").remove();
    
			var a=vorpal._delimiter.split("/");
			extid=a[1];			
			cliNode = new StromDAONode.Node({external_id:args.extid,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});								
			introspectMethods(cliNode,a,vorpal);
			cb();			
							
	})
    callback();
});		
		
vorpal
   .command("goto <path>")
   .action(function(args,callback) {
		vorpal.delimiter(args.path);

		var a=vorpal._delimiter.split("/");								
					
		introspectCalls(cliNode,a,vorpal);		   
	    callback();
	   
});
vorpal
  .command('account show <extid>')
  .option('--privatekey','Print Private Key.')
  .action(function (args, callback) {	 
    var node = new StromDAONode.Node({external_id:args.extid,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});
	this.log(vorpal._delimiter);
    this.log("Address",node.wallet.address);
    if (args.options.privatekey) {
		this.log("PrivateKey",node.wallet.privateKey);
	}
    
    callback();
});	

vorpal
  .command('account import <extid> <privatekey>') 
  .description('Sets a new private key to a external id') 
  .action(function (args, callback) {
    var node = new StromDAONode.Node({external_id:args.extid,privatKey:args.privatekey,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});
	
    this.log("Address",node.wallet.address);    
    
    callback();
});	

		
