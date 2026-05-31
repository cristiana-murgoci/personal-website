import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from abc import ABC, abstractmethod

class Bettor(ABC):
    def __init__(self, p, epsilon, boost=0.0, mu_win=0.0):
        self.p = p
        self.epsilon = epsilon
        self.boost = boost
        self.mu_win = mu_win
        self.w = np.random.normal(0, 1)
        self.bankroll = 0.0
        self.loss_streak = 0
        self.last_bet_time = -1

    @abstractmethod
    def profit_win(self, boost):
        pass

    @abstractmethod
    def profit_loss(self):
        pass

    @abstractmethod
    def perceived_ev(self, boost):
        pass

    @abstractmethod
    def update_w(self, current_time):
        pass

    def update_after_bet(self, win, time):
        self.last_bet_time = time
        if win:
            self.bankroll += self.profit_win(self.boost)
            self.loss_streak = 0
        else:
            self.bankroll += self.profit_loss()
            self.loss_streak += 1

    def eligible_for_boost(self, current_time, loss_streak, last_bet_time, max_inactive=5, max_loss_streak=3):
        if (current_time - last_bet_time) > max_inactive or loss_streak >= max_loss_streak:
            self.loss_streak = 0
            self.last_bet_time = current_time
            return True
        return False

class Naif(Bettor):
    def profit_win(self, boost):
        return 1 - self.p - self.epsilon + boost

    def profit_loss(self):
        return -(self.p + self.epsilon)

    def perceived_ev(self, boost):
        perc_p = np.clip(self.p + self.w, 0, 1)
        return perc_p * self.profit_win(boost) + (1 - perc_p) * self.profit_loss()

    def update_w(self, current_time):
        if self.last_bet_time != current_time:
            return
        shock = abs(np.random.normal(0, 1))
        if self.loss_streak == 0:
            self.w += shock
        else:
            self.w -= shock

class Sophisticate(Bettor):
    def profit_win(self, boost):
        return 1 - self.p - self.epsilon + boost

    def profit_loss(self):
        return -(self.p + self.epsilon)

    def perceived_ev(self, boost):
        perc_p = self.p
        return perc_p * self.profit_win(boost) + (1 - perc_p) * self.profit_loss()

    def update_w(self, current_time):
        self.w = 0

class Simulation:
    def __init__(self, num_naif, num_soph, p, epsilon, b, mu_win,
                 max_inactive=5, max_loss_streak=3):
        self.num_naif = num_naif
        self.num_soph = num_soph
        self.p = p
        self.epsilon = epsilon
        self.b = b
        self.mu_win = mu_win
        self.max_inactive = max_inactive
        self.max_loss_streak = max_loss_streak

    def run(self, T, scenario='none', seed=37):
        np.random.seed(seed)
        naifs = [Naif(self.p, self.epsilon, mu_win=self.mu_win)
                 for _ in range(self.num_naif)]
        sophs = [Sophisticate(self.p, self.epsilon, mu_win=self.mu_win)
                  for _ in range(self.num_soph)]
        records = []
        boost = 0.0

        for t in range(T):
            # single outcome shared across bettors
            win = np.random.rand() < self.p

            if scenario == 'none':
                boost = 0.0
            elif scenario == 'initial':
                boost = self.b if t == 0 else 0.0

            for bettor in naifs + sophs:
                if scenario == 'dynamic':
                    if t == 0:
                        boost = self.b
                    else:
                        targeted = bettor.eligible_for_boost(
                            t,
                            loss_streak=bettor.loss_streak,
                            last_bet_time=bettor.last_bet_time,
                            max_inactive=self.max_inactive,
                            max_loss_streak=self.max_loss_streak
                        )
                        boost = self.b if targeted else 0.0

                bettor.boost = boost
                ev = bettor.perceived_ev(boost)
                bet = ev >= 0

                if bet:
                    bettor.update_after_bet(win, t)
                    book_profit = -(bettor.profit_win(boost) if win else bettor.profit_loss())
                else:
                    book_profit = 0.0

                bettor.update_w(t)

                records.append({
                    'time': t,
                    'type': 'Naif' if isinstance(bettor, Naif) else 'Sophisticate',
                    'betted': bet,
                    'w': bettor.w,
                    'bankroll': bettor.bankroll,
                    'boost': boost,
                    'book_profit': book_profit
                })

        return pd.DataFrame(records)

def plot_results(df, title):
    summary = df.groupby(['time', 'type']).agg(
        frac_bet=('betted', 'mean'),
        avg_bankroll=('bankroll', 'mean')
    ).reset_index()

    # Fraction Betting
    plt.figure()
    for bettor_type in summary['type'].unique():
        sub = summary[summary['type'] == bettor_type]
        plt.plot(sub['time'], sub['frac_bet'], label=bettor_type)
    plt.xlabel('Time')
    plt.ylabel('Fraction Betting')
    plt.title(f'{title}: Fraction Betting')
    plt.legend()
    plt.show()

    plt.figure()
    for bettor_type in summary['type'].unique():
        sub = summary[summary['type'] == bettor_type]
        plt.plot(sub['time'], sub['avg_bankroll'], label=bettor_type)
    plt.xlabel('Time')
    plt.ylabel('Average Bankroll')
    plt.title(f'{title}: Average Bankroll')
    plt.legend()
    plt.show()

    # Cumulative Sportsbook Profit
    cum_profit = df.groupby("time")["book_profit"].sum().cumsum()
    plt.figure()
    plt.plot(cum_profit.index, cum_profit.values)
    plt.xlabel("Time")
    plt.ylabel("Profit")
    plt.title("Cumulative Sportsbook Profit")
    plt.show()

if __name__ == "__main__":
    sim = Simulation(num_naif=100, num_soph=15, p=0.5, epsilon=0.03, b=0.2, mu_win=0.15,
                     max_inactive=5, max_loss_streak=3)
    df_none = sim.run(T=500, scenario='none')
    df_initial = sim.run(T=500, scenario='initial')
    df_dynamic = sim.run(T=500, scenario='dynamic')

    plot_results(df_none, 'No Boost')
    plot_results(df_initial, 'Initial Boost')
    plot_results(df_dynamic, 'Dynamic Boost')
