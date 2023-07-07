<?php namespace Common\Auth\Controllers;

use App\User;
use Auth;
use Common\Auth\Validators\HashIsValid;
use Common\Core\BaseController;
use Hash;
use Illuminate\Http\Request;
use Session;

class ChangePasswordController extends BaseController
{
    public function __construct(protected Request $request, User $user)
    {
    }

    public function change(User $user)
    {
        $this->authorize('update', $user);

        $this->validate($this->request, $this->rules($user));

        $password = Hash::make($this->request->get('new_password'));
        $user->forceFill(['password' => $password])->save();

        // need to re-login after changing password
        if (Auth::id() === $user->id) {
            Session::forget('password_hash_web');
            Auth::guard('web')->login($user);
        }

        return $this->success();
    }

    private function rules(User $user): array
    {
        $rules = [
            'new_password' => 'required|confirmed',
        ];

        if ($user->hasPassword) {
            $rules['current_password'] = [
                'required',
                new HashIsValid($user->password),
            ];
            $rules['new_password'] .= '|different:current_password';
        }

        return $rules;
    }
}
