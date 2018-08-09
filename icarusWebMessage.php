<?php
    $link = mysqli_connect("localhost", "id3158876_icarususer", "hsjdhf@#@jfasd", "id3158876_icarusdata");
    
    // Check connection
    if($link === false){
        die("ERROR: Could not connect. " . mysqli_connect_error());
    }


    $name = $_POST['name'];
    $message = $_POST['message'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];


    if ($name == "" || $message == "" ) {
        echo "Please fill out all the form data!";
    }


    else{


    $sql = "INSERT INTO message (Name, Subject, Message, Email)
    VALUES ('$name', '$subject', '$message','$email')";

    if(mysqli_query($link, $sql)){
        //echo "Records added successfully.";

    } else{
        //echo "ERROR: Could not able to execute $sql. " . mysqli_error($link);
    }
    // close connection
    mysqli_close($link);
    header('Location: /index.html');

    }

?>