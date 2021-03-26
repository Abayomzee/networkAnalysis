<?php
    if(isset($_POST['start_problem'])) {
        $problem_title = $_POST['problem_name'];
        $activity_number = $_POST['problem_number_of_activity'];
        $time_unit = $_POST['problem_unit'];

        // echo $problem_title.' '.$activity_number.' '.$time_unit;

        

        header("location: variables_spec.php");
    } else {

    }
?>