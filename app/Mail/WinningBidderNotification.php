<?php


namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WinningBidderNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $bidder;
    public $asset;

    public function __construct($bidder, $asset)
    {
        $this->bidder = $bidder;
        $this->asset = $asset;
    }

    public function build()
    {
        return $this->subject('Congratulations! You Won the Auction')
                    ->view('emails.winning_bidder');
    }
}
