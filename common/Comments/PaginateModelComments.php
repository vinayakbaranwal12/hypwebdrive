<?php

namespace Common\Comments;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaginateModelComments
{
    public function execute(Model $commentable): array
    {
        $pagination = $commentable
            ->comments()
            ->rootOnly()
            ->with([
                'user' => fn(BelongsTo $builder) => $builder->compact(),
            ])
            ->paginate(request('perPage') ?? 25);

        $comments = app(LoadChildComments::class)->execute(
            $commentable,
            collect($pagination->items()),
        );

        $comments->transform(function (Comment $comment) {
            if ($comment->deleted) {
                $comment->content = null;
                $comment->setRelation('user', null);
            }
            return $comment;
        });

        $pagination = $pagination->toArray();
        $pagination['data'] = $comments;

        return $pagination;
    }
}
