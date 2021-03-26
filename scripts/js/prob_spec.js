$(document).ready(function () {

    $('.start_and_close_btn').click(function () {
        event.preventDefault();

        var $problem_spec = $('#prob_name').val();
        var $number_of_activity = $('#activity_num').val();
        $time_unit = $('#time_unit').val();

        if ($problem_spec == "" || $number_of_activity == "" || $time_unit == "") {
            alert('All fields are Compulsory');
        }

        if ($number_of_activity == '0') {
            alert('Number of activity cannot be Zero(0)');
        }


        if ($problem_spec != "" && $number_of_activity != "" && $time_unit != "" && $number_of_activity != 0) {
            $('.problem_spec_div').hide();

            // var counter = 0;
            var $table = $('.variable_declaration_body .spec_table');
            var $table_row = $table.find('tr:nth-child(2)');

            for (counter = 1; counter < $number_of_activity; ++counter) {

                var $clone = $table_row.clone().attr('id', 'row' + counter);
                $clone.find('td:nth-child(1) span').text(counter + 1);
                $clone.appendTo($table);
            }


            $('.variable_declaration_div').fadeIn('slow');
        }

    })

    function find_dup(arr){
        var object = {};
        var result = [];

        arr.forEach(function(item){
            if(!object[item])
                object[item] = 0;
            object[item] += 1;            
        })

        for(var prop in object){
            if(object[prop] >= 2){
                result.push(prop);
            }
        }
        return result;
    }

    var $all_table_data = [];


    $('.solve_main_problem_btn').click(function () {

        $('tr.var_rows').each(function () {

            var $each_rows = {
                critical_activity : false
            }

            $(this).find('td input').each(function () {

                $each_rows[$(this).attr('id')] = $(this).val();

            })

            $all_table_data.push($each_rows);

        })

        var $activity_name_array = [];
        var $immediate_pred_array = [];


        var $two_act = [];
        var back_duplicate_array = [];

        $.each($all_table_data, function (key, value) {

            // Set the EST LST and EFT of the starting activites

            if (value.immediate_predesessor == "") {
                value.$earliest_start_time = 0;
                value.$least_start_time = 0;
                value.$earliest_finish_time = parseInt(value.$earliest_start_time) + parseInt(value.activity_duration);
            };

            // Pushes all the Activity name and immediate activity name into an array

            $activity_name_array.push(value.activity_names);
            $immediate_pred_array.push(value.immediate_predesessor);

            // Set the EFT of the immediate predecessor (with one activiites) to the EST of the current activity

            if (value.immediate_predesessor != "" && value.immediate_predesessor.length == 1) {

                $.each($all_table_data, function (key, get_val) {

                    if (get_val.activity_names == value.immediate_predesessor) {

                        value.$earliest_start_time = get_val.$earliest_finish_time;

                    }
                })
            }

            // Set the EFT of an activty with one immediate_pred its (EST-DUR)

            $.each($all_table_data, function (key, check_value) {

                if (check_value.immediate_predesessor == value.activity_names && check_value.immediate_predesessor.length == 1) {

                    value.$earliest_finish_time = parseInt(value.$earliest_start_time) + parseInt(value.activity_duration);

                }
            })

            // Check if an activity pred is greater than one

            if (value.immediate_predesessor.length > 1) {

                // split and add the immediate activities that is more than one to the list of immediate activites

                $.merge($immediate_pred_array, value.immediate_predesessor.split(" "));

                var $aba = {                    
                    act_name : [],
                    activity_array : []                    
                };

                // loop tru all splitted ellement

                $.each(value.immediate_predesessor.split(" "), function (key, vv) {   

                        $.each($all_table_data, function (key, xx) {

                            if (xx.activity_names == vv) {

                                // pussh into one single array

                                $aba.main_act = value.activity_names;
                                $aba.act_name.push(vv);
                                $aba.activity_array.push(parseInt(xx.$earliest_start_time) + parseInt(xx.activity_duration));

                            }

                        })

                })
                $two_act.push($aba);
            }     

            //  set the EFT of of two activitiies in an immed pred

            $.each($two_act, function (key, set_eft) {

                $.each(set_eft.act_name, function(key, we){
 
                    $.each($all_table_data, function(key, don){
                        if(don.activity_names == we){

                            don.$earliest_finish_time = Math.max(...set_eft.activity_array);
                            
                        }
                    })                    

                })
                
            })

            // set the EST of an activity with two immed pred

            $.each($two_act, function(key, set_est){

                $.each($all_table_data, function(key, gett){

                    if(gett.activity_names == set_est.main_act){

                        gett.$earliest_start_time = Math.max(...set_est.activity_array);

                    }
                })
            })                        

        })

        // get the difference 

        var diff = $($activity_name_array).not($immediate_pred_array).get();

                var $last_activity_array = [];                   
           
            $.each(diff, function(key, diff_val){

                $.each($all_table_data, function(key, diff_data){

                    if(diff_data.activity_names == diff_val){

                        $last_activity_array.push(parseInt(diff_data.$earliest_start_time) + parseInt(diff_data.activity_duration));
                    
                    }
                })

            })
            // handle the last two activities

            $.each(diff, function(key, diff_val){

                $.each($all_table_data, function(key, set_last_eft){
                    if(set_last_eft.activity_names == diff_val){

                        set_last_eft.$earliest_finish_time = Math.max(...$last_activity_array);
                        set_last_eft.$least_finish_time = Math.max(...$last_activity_array);

                        set_last_eft.$least_start_time = set_last_eft.$least_finish_time - set_last_eft.activity_duration;
                    }
                })

            })   
            
            $('.problem_solution_report_value span').text(Math.max(...$last_activity_array)+" "+ $time_unit+'(s)');

        $($all_table_data.reverse()).each(function(key, wer){

             if(wer.immediate_predesessor.length > 1){                
                $.each(wer.immediate_predesessor.split(" "), function(key,  backward_lft){
                    $($all_table_data.reverse()).each(function(key, rtt){
                        if(rtt.activity_names == backward_lft){
                            rtt.$least_finish_time = wer.$least_start_time;
                            rtt.$least_start_time = rtt.$least_finish_time - rtt.activity_duration;
                        }
                    })
                })                                
            } else if(wer.immediate_predesessor.length == 1){
                $($all_table_data.reverse()).each(function(key, cas){

                    if(cas.activity_names == wer.immediate_predesessor){
                        cas.$least_finish_time = wer.$least_start_time;
                    }
                })
            }    
    
        })

        var dup_activities = find_dup($immediate_pred_array);

        $.each(dup_activities, function(key, upp){

            if(upp.length != 0){

            var backward_object = {                        
                check_dup : [],
                check_min : []
            }
            $.each($all_table_data, function(key, mmm){
                if(mmm.immediate_predesessor.length != 0 && mmm.immediate_predesessor == upp){
                    // console.log(mmm.activity_names);
                    
                    backward_object.dup_name = upp;
                    backward_object.check_dup.push(mmm.activity_names);
                    backward_object.check_min.push(parseInt(mmm.$least_finish_time) - parseInt(mmm.activity_duration))
                    
                }
                
            })            
            back_duplicate_array.push(backward_object);

        }
        })

        $.each(back_duplicate_array, function(key, ass){

            $.each($all_table_data, function(key, yyy){

                if(yyy.activity_names == ass.check_dup){
                    
                    yyy.$least_start_time = Math.min(...ass.check_min);

                }

                if(yyy.activity_names == ass.dup_name){
                    yyy.$least_finish_time = Math.min(...ass.check_min);
                }

            })

        })

        $.each($all_table_data, function(key, qqq){
            var start_critical = qqq.$earliest_start_time - qqq.$least_start_time;
            var end_critical = qqq.$earliest_finish_time - qqq.$least_finish_time;
            if(start_critical == 0 && end_critical == 0){
                qqq.critical_activity = true;
            }
        })

        $.each($all_table_data, function(key, nnn){
            nnn.$slack_time = nnn.$least_start_time - nnn.$earliest_start_time;
        })

        
        $('.variable_declaration_div').hide();


        $.each($all_table_data, function(key, display){

            var key = key+1;

                $('table#solut').append(
                    '<tr><td>'+ key +'</td>'
                    +'<td>'+ display.activity_names +'</td>'
                    +'<td>'+ display.critical_activity +'</td>'
                    +'<td>'+ display.activity_duration +'</td>'
                    +'<td>'+ display.$earliest_start_time +'</td>'
                    +'<td>'+ display.$earliest_finish_time +'</div>'
                    +'<td>'+ display.$least_start_time +'</div>'
                    +'<td>'+ display.$least_finish_time +'</div>'
                    +'<td>'+ display.$slack_time +'</td></tr>'
                    );        

        })


        $('.solution_declaration_div').fadeIn('slow');

        var graph = {
            "nodes": [
                {
                    "id": "start",
                    "label": "",
                    "x": 0,
                    "y": 0,
                    "size": 5
                },
                {
                    "id": "a",
                    "label": "A",
                    "x": 1,
                    "y": 3,
                    "size": 5
                }
            ],
            "edges": [
                {
                    "id": "a",
                    "source": "start",
                    "target": "a"
                    
                }
            ]
        }

        $.each($all_table_data, function(key, data){
            var obj = {

            }
            
            obj.id = data.activity_names;
            obj.label = data.activity_names;

        })
        
        
        console.log(back_duplicate_array);
        console.log($all_table_data);
        
        

    })

    $('.print_solution_btn').click(function(){
        window.print();
    })

    $('.back_main_problem_btn').click(function(){
        $('.solution_declaration_div').hide();
        $('.problem_spec_div').fadeIn('slow');
    })

    

})
