var resultArray
var userName
var userCount

if (localStorage.getItem('results')) {
  resultArray = JSON.parse(localStorage.getItem('results'))
} else {
  resultArray = []
}

$(function () {

  if(localStorage.getItem('user')){
    userName = localStorage.getItem('user')
    $('.nameHolder').text("Welcome "+userName)
  }
  else
  {
    userName = prompt("Enter pseduo-name to begin")
    localStorage.setItem('user',userName)
    $('.nameHolder').text("Welcome "+userName)
  }

	if(resultArray.length>0){
    count = 0;
  	for (i=resultArray.length-1;i>=0;i--){
      count = count + 1
      if (count > 10) break;
  		$('#logsTable tbody').append('<tr><td class="resultColumn">'+resultArray[i].split(":")[0]+'</td><td class="userColumn">'+
        resultArray[i].split(":")[1].split("::")[0]+'</td><td class="timeColumn">'+resultArray[i].split("::")[1]+'</td></tr>')
  	}
	}	

  var socket = io();
  $('form').submit(function(e){
  	localStorage.clear()
    e.preventDefault();
    result = parseExpression($('#inputExpression').val())
    if(result != -1){
      $('.invalidExpression').hide()
      result = formatResultForOutput(result)
      socket.emit('calculate',result);
      $('#inputExpression').val('');
      return false;
    }
    else{
      $('.invalidExpression').show()
    }
  });

  socket.on('calculate',function(caclulationResult){
    resultArray.push(caclulationResult)
    localStorage.setItem('user',userName)
  	localStorage.setItem('results',JSON.stringify(resultArray))
    $('#logsTable tbody').prepend('<tr />').children('tr:first').append('<td class="resultColumn">'+caclulationResult.split(":")[0]+
      '</td><td class="userColumn">'+caclulationResult.split(":")[1].split("::")[0]+
      '</td><td class="timeColumn">'+caclulationResult.split("::")[1]+'</td>')

    $('tbody tr').each(function(){
      if($("tr").index(this)>10){
        $(this).remove()
      }
    })
  });
}); 

function parseExpression(expression){

    inputExpression = expression
    evaluationExpression = inputExpression.replace(/ /g,'')
    evaluationExpression = evaluationExpression.replace(/[_(){}]/g,'')
    indexOfOperator = findIndexOfTheOperator(evaluationExpression)
    if (indexOfOperator == -1)
      return -1

    if(indexOfOperator.toString().includes("^") == false){
      firstOperand = evaluationExpression.slice(0,indexOfOperator)
      secondOperand = evaluationExpression.slice(indexOfOperator + 1,evaluationExpression.length + 1)
      operator = evaluationExpression[indexOfOperator]
      return checkOperandsAndGetResult(firstOperand,secondOperand,operator)

    }
    else{
      indexOfOperator = indexOfOperator.split("^")[0]
      firstOperand = evaluationExpression.slice(0,indexOfOperator)
      secondOperand = evaluationExpression.slice(parseInt(indexOfOperator) + 2,evaluationExpression.length + 1)
      return checkOperandsAndGetResult(firstOperand,secondOperand,"**")
    }
}

function identifyOperatorAndCalculateResult(firstOperand, secondOperand, operator){
  firstOperand = checkandSetOperandType(firstOperand)
  secondOperand = checkandSetOperandType(secondOperand)

  switch(operator){
    case "^":
    case "**":
              return firstOperand ** secondOperand
              break
    case "*":
    case "x": 
    case "X":
              return firstOperand * secondOperand
              break
    case "%":
              return firstOperand % secondOperand
              break
    case "/":
              return firstOperand / secondOperand
              break
    case "+":
              return firstOperand + secondOperand
              break
    case "-":
              return firstOperand - secondOperand
              break
  }

}

function findIndexOfTheOperator(evaluationExpression)
{
  for (i = 1; i<evaluationExpression.length; i++)
  {
    if(evaluationExpression[i] == "*" && evaluationExpression[i+1] == "*")
      return i+"^"

    if(evaluationExpression[i] == '*' || evaluationExpression[i].toLowerCase() == 'x' ||
      evaluationExpression[i] == '+' || evaluationExpression[i] == '/'
      || evaluationExpression[i] == '%' || evaluationExpression[i] == '-' || evaluationExpression[i] == '^')
    {
      return i
    }
  }
  return -1
}

function formatResultForOutput(result){
    var currentDatetime = new Date($.now())
  return result.concat(":",userName,"::",currentDatetime.toLocaleString())
}

function checkandSetOperandType(operand){
  tempOperand = parseFloat(operand) % 1
  if(tempOperand == 0)
    return parseInt(operand)
  else
    return parseFloat(operand)
}

function checkOperandsAndGetResult(firstOperand,secondOperand,operator)
{
  if(isNaN(firstOperand) || isNaN(secondOperand))
    return -1
  
  result = identifyOperatorAndCalculateResult(firstOperand,secondOperand,operator)
  
  if(result == undefined || result == null || isNaN(result)){
        return -1  
  }
  else{
        result = firstOperand.concat(" ",operator," ",secondOperand," = ",result)  
        return result
  }
}