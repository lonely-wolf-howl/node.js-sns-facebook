const express = require('express');
const friendsRouter = express.Router();

const { checkAuthenticated } = require('../middleware/auth');

const User = require('../models/users.model');

friendsRouter.get('/', checkAuthenticated, async (req, res) => {
  try {
    const users = await User.find({});
    res.render('friends', {
      users: users,
    });
  } catch {
    req.flash('error', '사용자 목록 조회 중 오류가 발생했습니다.');
    res.redirect('/posts');
  }
});

// 친구 요청 보내기
friendsRouter.put('/:id/add-friend', checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', '사용자가 존재하지 않습니다.');
      res.redirect('/posts');
    } else {
      await User.findByIdAndUpdate(user._id, {
        friendsRequests: user.friendsRequests.concat([req.user._id]),
      });
      req.flash('success', '친구 요청을 보냈습니다.');
      res.redirect('/friends');
    }
  } catch {
    req.flash('error', '친구 요청 중 오류가 발생했습니다.');
    res.redirect('/posts');
  }
});

// 친구 요청 보내기 취소하기, 나에게 온 친구 요청 거절하기
// firstId: 친구 요청을 받은 사람, secondId: 친구 요청을 보낸 사람
friendsRouter.put(
  '/:firstId/remove-friend-request/:secondId',
  checkAuthenticated,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.firstId);
      if (!user) {
        req.flash('error', '사용자가 존재하지 않습니다.');
        res.redirect('/posts');
      } else {
        await User.findByIdAndUpdate(user._id, {
          friendsRequests: user.friendsRequests.filter(
            (friendId) => friendId !== req.params.secondId
          ),
        });
        if (req.user._id.toString() === req.params.firstId) {
          req.flash('success', '나에게 온 친구 요청을 거절했습니다.');
        } else {
          req.flash('success', '친구 요청을 취소했습니다.');
        }
        res.redirect('/friends');
      }
    } catch {
      if (req.user._id.toString() === req.params.firstId) {
        req.flash('error', '나에게 온 친구 요청 거절 중 오류가 발생했습니다.');
      } else {
        req.flash('error', '친구 요청 취소 중 오류가 발생했습니다.');
      }
      res.redirect('/posts');
    }
  }
);

// 친구 요청 수락하기
friendsRouter.put(
  '/:id/accept-friend-request',
  checkAuthenticated,
  async (req, res) => {
    try {
      const senderUser = await User.findById(req.params.id);
      if (!senderUser) {
        req.flash('error', '사용자가 존재하지 않습니다.');
        res.redirect('/posts');
      } else {
        await User.findByIdAndUpdate(senderUser._id, {
          friends: senderUser.friends.concat([req.user._id]),
        });
        await User.findByIdAndUpdate(req.user._id, {
          friends: req.user.friends.concat([senderUser._id]),
          friendsRequests: req.user.friendsRequests.filter(
            (friendId) => friendId !== senderUser._id.toString()
          ),
        });
        req.flash('success', '나에게 온 친구 요청을 수락했습니다.');
        res.redirect('/friends');
      }
    } catch {
      req.flash('error', '나에게 온 친구 요청 수락 중 오류가 발생했습니다.');
      res.redirect('/posts');
    }
  }
);

// 내 친구 목록에서 삭제하기
friendsRouter.put(
  '/:id/remove-friend',
  checkAuthenticated,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.flash('error', '사용자가 존재하지 않습니다.');
        res.redirect('/posts');
      } else {
        await User.findByIdAndUpdate(user._id, {
          friends: user.friends.filter(
            (friendId) => friendId !== req.user._id.toString()
          ),
        });
        await User.findByIdAndUpdate(req.user._id, {
          friends: req.user.friends.filter(
            (friendId) => friendId !== req.params.id.toString()
          ),
        });
        req.flash('success', '내 친구 목록에서 삭제했습니다.');
        res.redirect('/friends');
      }
    } catch {
      req.flash('error', '내 친구 목록에서 삭제 중 오류가 발생했습니다.');
      res.redirect('/posts');
    }
  }
);

module.exports = friendsRouter;
