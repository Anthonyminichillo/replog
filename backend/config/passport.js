import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

export default function configurePassport(db) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },
      async (email, password, done) => {
        try {
          const user = await db.collection('users').findOne({ email });

          if (!user) {
            return done(null, false, {
              message: 'Incorrect email or password.',
            });
          }

          const passwordMatches = await bcrypt.compare(password, user.password);

          if (!passwordMatches) {
            return done(null, false, {
              message: 'Incorrect email or password.',
            });
          }

          const authenticatedUser = {
            _id: user._id,
            email: user.email,
          };

          return done(null, authenticatedUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
}
