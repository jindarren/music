/**
 * Created by chen on 10/30/15.
 */


//type: 1: checkbox selection; 2: sorting; 3: intersection browsing(mouse over); 4: items' selection; 5: item selection; 6. query submission; 7. bookmark the paper
window.userBehavior = [];
//userBehaviorTemp = [];


$(EventManager).bind("user-behavior-added", function(){
//   if(userBehavior.length > 5){
//       var date = new Date();
//       if(userBehaviorTemp.length > 0){
//           userBehaviorTemp.push({ type: 10, info: "duplicate", time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds() })
//       }
//       userBehaviorTemp = userBehaviorTemp.concat(userBehavior);
//       userBehavior = [];
//       userBehavior.push({name: globalname, time: (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds() });
//       console.log(userBehavior);
//       $.ajax({
//           url: 'savedata',
//           type: 'POST',
//           contentType:'application/json',
//           data: JSON.stringify(userBehaviorTemp),
//           dataType:'json',
//           success: function(res){
//               userBehaviorTemp = [];
//               console.log(res);
//           },
//           error: function()
//           {
//               console.log("writing error!");
//           }
//       });
//   }
});


$('#questionnaire').click(function(){
    $.ajax({
        url: 'savedata',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(userBehavior),
        dataType: 'json',
        success: function (res) {
            console.log(res);
        },
        error: function()
        {
            console.log("writing error!");
        }
    });
})

//window.onbeforeunload = function() {
//
//}