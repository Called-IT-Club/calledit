export default function SponsoredCard() {
    return (
        <div className="card p-5 border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gray-100 dark:bg-gray-700">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promoted</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                        Get $200 in Bonus Bets on DraftKings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        New customers only. Bet $5 on any sport and get $200 in bonus bets instantly. Terms apply.
                    </p>

                    <a
                        href="https://draftkings.com"
                        target="_blank"
                        className="btn bg-green-600 hover:bg-green-700 text-white w-full text-center block"
                    >
                        Claim Offer
                    </a>
                </div>
            </div>
        </div>
    );
}
