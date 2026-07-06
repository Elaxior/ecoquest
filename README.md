# 🌱 EcoQuest - AI-Powered Environmental Education Platform

> Transform Learning Into Environmental Action

**EcoQuest** is an innovative, gamified environmental education platform designed for students across India. It combines educational content with gamification mechanics to make environmental learning engaging, interactive, and impactful.

## 🎯 About EcoQuest

EcoQuest is a team project created by **Vivek** and **Rahul Kumar Gupta** to revolutionize how students engage with environmental education. By combining AI technology, gamified learning, and real-world action, we're empowering the next generation of environmental warriors.

### 🌐 Live Demo
**[Visit EcoQuest](https://ecoquestt.netlify.app/)**

---

## ✨ Key Functionalities

### 🎮 **Gamified Learning System**
- **XP (Experience Points)**: Earn XP by completing environmental quests and challenges
- **Leveling System**: Progress through levels as you accumulate XP
- **Real-time Progress Tracking**: Visual progress bars and achievement indicators
- **Day Streak Feature**: Maintain daily streaks to unlock bonus rewards

### 🌍 **Regional Environmental Quests**
- **Location-Specific Challenges**: Quests tailored to your state and local ecosystem
- **Diverse Quest Categories**: Water conservation, waste management, energy efficiency, tree planting, and more
- **Quest Details Page**: In-depth information about each environmental mission
- **Real-World Task Submission**: Submit photos of your environmental actions for AI verification

### 🤖 **AI-Powered Eco-Buddy Assistant**
- **Intelligent Chatbot**: Get instant answers to environmental questions
- **24/7 Support**: Always available to provide guidance and educational content
- **Contextual Help**: AI understands environmental queries and provides relevant suggestions

### 🏆 **Comprehensive Leaderboard System**
- **National Rankings**: Compete with students across India
- **School-Level Leaderboards**: See how your school ranks nationally
- **Real-Time Ranking Updates**: Dynamic rankings based on your performance
- **Rank Change Tracking**: Monitor your progress up the leaderboard

### 🤝 **School Guilds & Collaborative Learning**
- **School Communities**: Join your school's guild for collaborative projects
- **Team Achievements**: Complete group missions with your school mates
- **Collaborative Challenges**: Work together on larger environmental initiatives
- **School Pride Mechanics**: Compete with other schools on environmental impact

### 🎖️ **Achievement & Badge System**
- **Digital Badges**: Unlock badges for completing specific challenges
- **Achievement Tiers**: Multiple badge levels (Beginner, Intermediate, Expert)
- **Badge Display**: Showcase your achievements on your profile
- **Motivational Goals**: Clear milestones to work towards

### 📊 **Advanced Analytics & Profile**
- **Personal Dashboard**: Comprehensive overview of your environmental journey
- **Environmental Impact Metrics**:
  - 🌱 Trees Planted
  - 💧 Water Saved (in Liters)
  - ♻️ Waste Recycled (in kg)
  - ⚡ Energy Saved (in kWh)
- **Custom Profile**: Display name, school, state, and bio
- **Statistics Tracking**: Monitor your contribution to environmental conservation

### 👤 **User Authentication & Profiles**
- **Secure Registration**: Create an account with email and password
- **Login System**: Secure authentication for all users
- **Profile Customization**: Update personal information and preferences
- **Multi-Tab Profile Management**: Organize information across Personal, Achievements, Statistics, and Settings tabs

### ⚙️ **Advanced Settings**
- **Notification Preferences**: Control email notifications and updates
- **Privacy Settings**: Make your profile public or private
- **Leaderboard Visibility**: Choose whether to display on leaderboards
- **Account Management**: Options to update profile and delete account

### 📱 **Responsive Design**
- **Mobile-Optimized**: Fully responsive interface for all devices
- **Touch-Friendly Navigation**: Easy mobile menu and interaction
- **Adaptive Layouts**: Desktop, tablet, and mobile versions
- **Progressive Enhancement**: Works seamlessly across all screen sizes

### 🔒 **Admin Panel**
- **Administrator Dashboard**: Manage users and quests
- **Content Management**: Create and update environmental quests
- **User Moderation**: Monitor platform activity

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Styling** | Tailwind CSS (v4.1.13) |
| **Typography** | Inter Font Family |
| **Build Tool** | Node.js |
| **Package Manager** | npm |
| **Icons & Emojis** | Unicode & SVG |

### Dependencies
```json
{
  "devDependencies": {
    "tailwindcss": "^4.1.13"
  },
  "dependencies": {
    "dotenv": "^17.2.2"
  }
}
```

---

## 📁 Project Structure

```
ecoquest/
├── index.html              # Landing page
├── dashboard.html          # User dashboard
├── login.html              # Login page
├── register.html           # Registration page
├── profile.html            # User profile page
├── quests.html             # Available quests page
├── quest-detail.html       # Individual quest details
├── leaderboard.html        # Leaderboard/rankings
├── admin.html              # Admin panel
├── package.json            # Dependencies configuration
├── package-lock.json       # Locked dependency versions
├── .gitignore              # Git ignore rules
├── js/                     # JavaScript modules
│   ├── auth/               # Authentication logic
│   ├── dashboard/          # Dashboard functionality
│   ├── chatbot/            # AI Eco-Buddy
│   └── mobile-menu.js      # Mobile navigation
└── assets/                 # Images, icons, and media
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Elaxior/ecoquest.git
   cd ecoquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your configuration variables (API keys, etc.)

4. **Run the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000` (or your configured port)

---

## 🎮 How to Use

### For Students
1. **Register**: Create your account on the registration page
2. **Complete Your Profile**: Add your school, state, and environmental interests
3. **Explore Quests**: Browse available environmental quests on the Quests page
4. **Earn XP**: Complete quests and submit photos of your environmental actions
5. **Track Progress**: Monitor your level, badges, and environmental impact on your dashboard
6. **Compete**: Check leaderboards and compete with other students
7. **Ask Eco-Buddy**: Use the AI chatbot for environmental questions

### For Schools
1. **Create School Guild**: Connect your school community
2. **Collaborate**: Work on group environmental projects
3. **Track Impact**: Monitor your school's collective environmental impact
4. **Compete**: Climb the school rankings and earn recognition

### For Administrators
1. **Login**: Access the admin panel with admin credentials
2. **Manage Quests**: Create, edit, and update environmental quests
3. **Monitor Users**: View user activity and engagement
4. **Verify Submissions**: Review and approve photo submissions from students

---

## 🌟 Features Highlight

### What Makes EcoQuest Unique?

✅ **AI-Powered Verification**: Smart image recognition to verify real environmental actions  
✅ **Regional Relevance**: Quests tailored to local environmental issues  
✅ **Gamification at Scale**: Engaging mechanics that sustain motivation  
✅ **Real Impact**: Track tangible environmental contributions  
✅ **Community Building**: School guilds foster collaboration and peer learning  
✅ **24/7 AI Support**: Eco-Buddy chatbot provides instant environmental education  
✅ **National Reach**: Connect with thousands of students across India  

---

## 📈 Impact & Statistics

Users can track their environmental contributions including:
- Number of trees planted
- Water saved in liters
- Waste recycled in kilograms
- Energy saved in kilowatt-hours
- Participation streak and consistency
- School and national rankings

---

## 🤝 Contributing

We welcome contributions! To contribute to EcoQuest:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👥 Team

**Project Created By:**
- **Vivek** - Co-founder
- **Rahul Kumar Gupta** - Co-founder
- **Tarun Bhardwaj** - Co-founder

---

## 📞 Support & Feedback

- 🐛 **Report Issues**: Create an issue on GitHub
- 💡 **Suggest Features**: Share your ideas in the discussions
- 📧 **Contact Us**: Reach out through the platform

---

## 🌍 Join the Environmental Movement

EcoQuest is more than a platform—it's a movement to make environmental education engaging and impactful. Every quest completed, every badge earned, and every action taken brings us closer to a sustainable future.

**Ready to become an Eco-Warrior?**  
**[Start Your Journey Today!](https://ecoquestt.netlify.app/)**

---

## 🎓 Learning Outcomes

Through EcoQuest, students learn about:
- Environmental conservation and sustainability
- Climate change mitigation strategies
- Waste management and recycling
- Water and energy conservation
- Biodiversity protection
- Local and regional environmental challenges
- How technology can solve environmental problems
- Collaborative problem-solving

---

## 🚀 Future Roadmap

- [ ] Mobile app (iOS & Android)
- [ ] Multiplayer environmental challenges
- [ ] Partnerships with schools and NGOs
- [ ] Advanced AI content personalization
- [ ] Integration with environmental organizations
- [ ] Blockchain-based badge verification
- [ ] International expansion beyond India

---

**Last Updated**: June 2026  
**Repository**: [Elaxior/ecoquest](https://github.com/Elaxior/ecoquest)  
**Website**: [https://ecoquestt.netlify.app/](https://ecoquestt.netlify.app/)

---

*"Every small action towards environmental conservation is a step towards a better future. Join EcoQuest and make a difference today!" 🌱*
```
