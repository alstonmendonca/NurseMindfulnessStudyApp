import AsyncStorage from '@react-native-async-storage/async-storage';

const AFFIRMATION_INDEX_KEY = '@affirmation_current_index';
const LAST_AFFIRMATION_DATE_KEY = '@affirmation_last_date';

export interface Affirmation {
  quote: string;
  author: string;
}

// 50 Famous inspirational quotes
const AFFIRMATIONS: Affirmation[] = [
  { quote: "Just do it.", author: "Nike" },
  { quote: "Seize the day.", author: "Horace" },
  { quote: "I came, I saw, I conquered.", author: "Julius Caesar" },
  { quote: "You can do it!", author: "Rob Schneider" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The future belongs to those who believe in their dreams.", author: "Eleanor Roosevelt" },
  { quote: "You are never too old to set another goal.", author: "C.S. Lewis" },
  { quote: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { quote: "Act as if what you do makes a difference. It does.", author: "William James" },
  { quote: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { quote: "Do not wait; the time will never be 'just right.'", author: "Napoleon Hill" },
  { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { quote: "Believe in yourself. You are braver than you think.", author: "Christopher Robin" },
  { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { quote: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { quote: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { quote: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { quote: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Only I can change my life. No one can do it for me.", author: "Carol Burnett" },
  { quote: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { quote: "Nothing is impossible. The word itself says 'I'm possible!'", author: "Audrey Hepburn" },
  { quote: "The difference between winning and losing is most often not quitting.", author: "Walt Disney" },
  { quote: "You are enough just as you are.", author: "Meghan Markle" },
  { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { quote: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { quote: "You learn more from failure than from success.", author: "Bram Stoker" },
  { quote: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { quote: "If you are working on something that you really care about, you don't have to be pushed.", author: "Steve Jobs" },
  { quote: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
  { quote: "Failure will never overtake me if my determination to succeed is strong enough.", author: "Og Mandino" },
  { quote: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { quote: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang Von Goethe" },
  { quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { quote: "You are never too small to make a difference.", author: "Greta Thunberg" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { quote: "The best use of creativity is imagination. The worst use of creativity is anxiety.", author: "Deepak Chopra" },
  { quote: "Instead of worrying about what you cannot control, shift your energy to what you can create.", author: "Roy T. Bennett" },
  { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
];

export class AffirmationsService {
  /**
   * Get today's date as a string (YYYY-MM-DD)
   */
  private static getTodayDateString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get today's affirmation - cycles through all 50 affirmations
   */
  static async getTodaysAffirmation(): Promise<Affirmation> {
    try {
      const lastDate = await AsyncStorage.getItem(LAST_AFFIRMATION_DATE_KEY);
      const today = this.getTodayDateString();
      
      let currentIndex = 0;

      if (lastDate === today) {
        // Same day - return the same affirmation
        const storedIndex = await AsyncStorage.getItem(AFFIRMATION_INDEX_KEY);
        if (storedIndex !== null) {
          currentIndex = parseInt(storedIndex, 10);
        }
      } else {
        // New day - get next affirmation
        const storedIndex = await AsyncStorage.getItem(AFFIRMATION_INDEX_KEY);
        if (storedIndex !== null) {
          currentIndex = (parseInt(storedIndex, 10) + 1) % AFFIRMATIONS.length;
        }
        
        // Save new index and date
        await AsyncStorage.setItem(AFFIRMATION_INDEX_KEY, currentIndex.toString());
        await AsyncStorage.setItem(LAST_AFFIRMATION_DATE_KEY, today);
      }

      return AFFIRMATIONS[currentIndex];
    } catch (error) {
      console.error('Error getting daily affirmation:', error);
      // Return first affirmation as fallback
      return AFFIRMATIONS[0];
    }
  }

  /**
   * Get total number of affirmations
   */
  static getTotalAffirmations(): number {
    return AFFIRMATIONS.length;
  }

  /**
   * Reset affirmation index (for testing purposes)
   */
  static async resetAffirmationIndex(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AFFIRMATION_INDEX_KEY);
      await AsyncStorage.removeItem(LAST_AFFIRMATION_DATE_KEY);
    } catch (error) {
      console.error('Error resetting affirmation index:', error);
    }
  }
}
