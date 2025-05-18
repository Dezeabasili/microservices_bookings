const bookingConfirmation_1 = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .hotelName {
            background-color: blue;
            color: white;
            text-align: center;
            padding: 1px;
        }
    </style>
</head>
<body>
    <div class="hotelName">
        <h1>Meridian Hosts</h1>
    </div>
    <h4>Hi ,</h4>
    <p>
        Management and staff at Meridian Hosts are pleased to welcome you. 
        We hope you will be having a wonderful stay in our property.    
    </p>
    <p>
        Details of your booking are stated below.
    </p>
    <br/> `

    const bookingConfirmation_2 = `
    <br/>
    <p>
        We thank you for choosing Meridian Hosts and we look forward to hosting you.
    </p>
    <h5>Best regards,</h5>
    <h5>Hotel Management</h5>
</body>
</html>
    `


    const bookingConfirmation_3 = bookingConfirmation_1 + bookingConfirmation_2

    console.log('bookingConfirmation_3: ', bookingConfirmation_3)
    