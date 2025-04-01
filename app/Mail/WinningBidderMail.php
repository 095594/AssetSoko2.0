<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WinningBidderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $asset;
    public $winningBid;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $asset, $winningBid)
    {
        $this->user = $user;
        $this->asset = $asset;
        $this->winningBid = $winningBid;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('🎉 Congratulations! You Won the Auction')
                    ->view('emails.winning_bidder');
    }
}
