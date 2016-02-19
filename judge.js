var J = {};
(function(global) {
  "use strict";
  
    var Judge = function(env, envTeAgent, envSpAgent1, envSpAgent2, envSpAgent3) {
        this.env = env; // store pointer to environment
        this.envTeAgent = envTeAgent; // store pointer to environment
        this.envSpAgent1 = envSpAgent1; // store pointer to environment
        this.envSpAgent2 = envSpAgent2; // store pointer to environment
        this.envSpAgent3 = envSpAgent3; // store pointer to environment
        this.TAB_MAX = 50;
        this.xCell0 = null;
        this.yCell0 = null;
        this.d0 = 0;
        
        //Entropy
        this.entHistColor;
        this.freqActionHistory = [];
        this.freqJ1J2History= [];
        
        //Goal
        this.colorG = 0;
        
        this.valuesAction = new Object();
        this.valuesAction.min = 0;
        this.valuesAction.max = 1;
        this.valuesAction.cpt = 0;
        this.valuesAction.target = Math.random();
        
        this.valuesJ1J2 = new Object();        
        this.valuesJ1J2.min = 0;
        this.valuesJ1J2.max = 1;
        this.valuesJ1J2.cpt = 0;
        this.valuesJ1J2.target =  Math.random();
        
        //Final reward
        this.rewardT = 0;
        this.rewardS = 0;
        
        this.reset();
    };
    Judge.prototype = {
        reset: function() {
            //Spatial env history
            this.a1 = [];
            this.a2 = [];
            this.a3 = [];
        },
        getReward:function(){
            return this.rewardT+this.rewardS;
        },
        getRewardSpatial:function(){
            return this.rewardS;
        },
        setRewardSpatial:function(reward){
            return this.rewardS = reward;
        },
        computeRewardTemporal:function(){
            this.rewardT = 0;
            var state = this.envTeAgent.getState();
            
            // save entropy values in history
            if(this.freqActionHistory.length >= 1000){
                this.freqActionHistory = this.freqActionHistory.slice(1);
                this.freqJ1J2History = this.freqJ1J2History.slice(1);
            }
            
            // decision of play / total decision
            this.freqActionHistory.push(state[0]);
            this.freqJ1J2History.push(state[1]);
            
            //reward - pour freqAction
//            var entAction = this.computeEntropy(freqAction);
//            var entHumanAgent = this.computeEntropy(freqJ1J2);
            
            // save entropy values in history
//            if(this.entActionHistory.length >= 1000){
//                this.entActionHistory = this.entActionHistory.slice(1);
//                this.entHumanAgentHistory = this.entHumanAgentHistory.slice(1);
//            }
//            this.entActionHistory.push(entAction);
//            this.entHumanAgentHistory.push(entHumanAgent);
            
//            // update max and min entropy values if needed
//            if(entAction < this.valuesAction.min){
//                this.valuesAction.min = entAction;
//            }
//            if(entAction > this.valuesAction.max){
//                this.valuesAction.max = entAction;
//            }
//            
//            if(entHumanAgent < this.valuesJ1J2.min){
//                this.valuesJ1J2.min = entHumanAgent;
//            }
//            if(entHumanAgent > this.valuesJ1J2.max){
//                this.valuesJ1J2.max = entHumanAgent;
//            }
            
            // check the stability on the entropy history
            this.checkStability(this.freqActionHistory,this.valuesAction);
            this.checkStability(this.freqJ1J2History,this.valuesJ1J2);
            
            this.rewardT = -Math.abs(state[0] - this.valuesAction.target);
            this.rewardT += -Math.abs(state[1] - this.valuesJ1J2.target);
        },
        computeRewardSpatial:function(a1,a2,a3,cell){
            var cellHuman = this.env.cClick;
            
            var xCellH1 = this.env.stox(cellHuman);
            var yCellH1 = this.env.stoy(cellHuman);
            var xCell1 = this.env.stox(cell);
            var yCell1 = this.env.stoy(cell);
            
            // Compute distance
            var d1 = Math.sqrt(Math.pow(xCellH1 - xCell1,2) + Math.pow(yCellH1 - yCell1,2));
            var rewardDistance = -d1;
            
            if(xCell1 === this.xCell0 && yCell1 === this.yCell0){
                rewardDistance-=0.5;
            }
            this.xCell0 = xCell1;
            this.yCell0 = yCell1;
            this.d0 = d1;
            
            //var reward = rewardDistance;
            
             // Color
            var histColor = this.updateHistogramColor();
            var entHistColor = this.computeEntropy(histColor);
            
//          Global entropy TODO
//          var entA1 = this.computeEntropy(this.a1, 8);
//          var entA2 = this.computeEntropy(this.a2, 8);
//          var entA3 = this.computeEntropy(this.a3, 8);
            //this.rewardS = -Math.abs(entHistColor - this.colorG);
            this.rewardS = 0;
            
            ///////////////////////////////////////////////////////////////////////
            
        },
        updateHistogramColor:function(){
            var tab = [];
            tab[0] = this.env.white / 729;
            tab[1] = this.env.red / 729;
            tab[2] = this.env.blue / 729;
            return tab;
        },
        computeEntropy:function(tab){
            var entropy = 0;
            for(var i = 0;i < tab.length;i++){
                if(tab[i] !== 0){
                    entropy = entropy -  tab[i]*(Math.log(tab[i]));
                }
            }
            return entropy;
        },
        checkStability:function(history,obj){
            obj.cpt = obj.cpt + 1;
            if(history.length >= 1000){
                var sum = 0;
                for(var i = 0;i < history.length;i++){
                    sum += history[i];
                }
                var mean = sum/(history.length);
                
                var distanceRelative = 0;
                for(var i = 0;i < history.length;i++){
                    distanceRelative += Math.pow((history[i]-mean), 2);
                }
                
                distanceRelative = distanceRelative/history.length;
                
                distanceRelative = Math.sqrt(distanceRelative);
                
                var sumLast = 0;
                for(var i = 1; i <=10; i++){
                    sumLast += history[history.length-i];
                }
                var meanLast = sumLast/10;
                
                if(((distanceRelative < 0.02) && (Math.abs(meanLast-obj.target)) < 0.1) || (obj.cpt > 4000)){
                    obj.target = Math.random();
                    obj.cpt = 0;
                }
            }    
        }
        
    };
    global.Judge = Judge;
})(J);